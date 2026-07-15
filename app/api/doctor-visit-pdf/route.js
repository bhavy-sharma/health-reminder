import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import puppeteer from "puppeteer";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patient, doctor, visit, healthRecords, includeItems, generatedAt } = body;

    // ─── De-duplicate records ───
    const seen = new Set();
    const dedupedRecords = (healthRecords || []).filter((r) => {
      const key = r.fileUrl || r.id || r.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`📄 Original: ${healthRecords?.length || 0}, Deduped: ${dedupedRecords.length}`);

    // 1. Render summary HTML to PDF
    const html = generatePDFHTML(patient, doctor, visit, dedupedRecords, includeItems, generatedAt);
    const summaryPdfBytes = await renderHtmlToPdf(html);

    // 2. Fetch and merge each attached document
    const finalPdfBytes = await buildFinalPdf(summaryPdfBytes, dedupedRecords);

    const safeName = (patient?.name || "patient").replace(/[^\w-]+/g, "-");

    return new NextResponse(finalPdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="health-summary-${safeName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

// ─── Render HTML to PDF ──────────────────────────────────────
async function renderHtmlToPdf(html) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

// ─── Build final PDF with all attachments ────────────────────
async function buildFinalPdf(summaryPdfBytes, healthRecords) {
  const finalDoc = await PDFDocument.create();

  // Add summary pages
  const summaryDoc = await PDFDocument.load(summaryPdfBytes);
  const summaryPages = await finalDoc.copyPages(summaryDoc, summaryDoc.getPageIndices());
  summaryPages.forEach((p) => finalDoc.addPage(p));

  const font = await finalDoc.embedFont(StandardFonts.HelveticaBold);

  for (const record of healthRecords) {
    if (!record.fileUrl) {
      console.log(`⚠️ No fileUrl for record: ${record.title}`);
      continue;
    }

    console.log(`📥 Processing: ${record.title} (${record.mimeType || 'unknown type'})`);
    console.log(`📥 File URL: ${record.fileUrl}`);
    console.log(`📥 Public ID: ${record.filePublicId}`);

    try {
      // Get the file bytes from Cloudinary using the proper method
      const fileBytes = await fetchFileBytes(record);
      
      if (!fileBytes || fileBytes.length === 0) {
        console.log(`❌ No bytes returned for: ${record.title}`);
        addPlaceholderPage(finalDoc, font, record, "Document could not be retrieved");
        continue;
      }

      console.log(`📦 Got ${fileBytes.length} bytes for: ${record.title}`);
      console.log(`📦 First 10 bytes: ${Array.from(fileBytes.slice(0, 10)).join(', ')}`);

      // Check if it's a PDF by looking at the bytes signature
      const isPdf = fileBytes.length > 4 && 
        fileBytes[0] === 0x25 && fileBytes[1] === 0x50 && 
        fileBytes[2] === 0x44 && fileBytes[3] === 0x46;

      console.log(`📄 Is PDF: ${isPdf}`);

      if (isPdf) {
        try {
          const attachedDoc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
          const copiedPages = await finalDoc.copyPages(attachedDoc, attachedDoc.getPageIndices());
          copiedPages.forEach((p) => finalDoc.addPage(p));
          console.log(`✅ Embedded PDF: ${record.title} (${copiedPages.length} pages)`);
        } catch (pdfError) {
          console.error(`❌ Failed to load PDF "${record.title}":`, pdfError.message);
          addPlaceholderPage(finalDoc, font, record, "PDF could not be loaded (may be corrupted)");
        }
      } else {
        // Try to embed as image
        try {
          await embedImagePage(finalDoc, fileBytes, 'png');
          console.log(`✅ Embedded as PNG: ${record.title}`);
        } catch {
          try {
            await embedImagePage(finalDoc, fileBytes, 'jpg');
            console.log(`✅ Embedded as JPG: ${record.title}`);
          } catch {
            addPlaceholderPage(
              finalDoc,
              font,
              record,
              `File type ${record.mimeType || 'unknown'} cannot be embedded. Please download the original file.`
            );
          }
        }
      }
    } catch (err) {
      console.error(`❌ Failed to embed record "${record.title}":`, err.message);
      addPlaceholderPage(finalDoc, font, record, "Document could not be processed");
    }
  }

  return finalDoc.save();
}

// ─── Fetch file bytes from Cloudinary ────────────────────────
async function fetchFileBytes(record) {
  const fileUrl = record.fileUrl;
  const publicId = record.filePublicId;

  // METHOD 1: Try direct fetch with the URL as-is
  try {
    console.log(`🌐 Trying direct fetch: ${fileUrl}`);
    const response = await fetch(fileUrl, {
      headers: {
        'Accept': 'application/pdf, application/octet-stream, */*',
      },
    });
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > 0) {
        console.log(`✅ Direct fetch successful: ${record.title} (${buffer.byteLength} bytes)`);
        return new Uint8Array(buffer);
      }
    }
    console.log(`⚠️ Direct fetch failed with status: ${response.status}`);
  } catch (err) {
    console.log(`⚠️ Direct fetch error: ${err.message}`);
  }

  // METHOD 2: Use Cloudinary SDK to generate a download URL
  if (publicId) {
    try {
      // Generate a signed URL for the raw resource
      // The key is to use 'raw' as the resource_type and 'upload' as the type
      const signedUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        type: 'upload',
        format: 'pdf',
        sign_url: true,
        flags: 'attachment',
      });
      
      console.log(`🔑 Trying signed URL with flags: ${signedUrl}`);
      const response = await fetch(signedUrl);
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 0) {
          console.log(`✅ Signed URL fetch successful: ${record.title} (${buffer.byteLength} bytes)`);
          return new Uint8Array(buffer);
        }
      }
      console.log(`⚠️ Signed URL fetch failed: ${response.status}`);

      // METHOD 3: Try with just the public ID and raw resource type
      const rawUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        type: 'upload',
        sign_url: true,
      });
      
      console.log(`🔑 Trying raw URL: ${rawUrl}`);
      const response2 = await fetch(rawUrl);
      
      if (response2.ok) {
        const buffer = await response2.arrayBuffer();
        if (buffer.byteLength > 0) {
          console.log(`✅ Raw URL fetch successful: ${record.title} (${buffer.byteLength} bytes)`);
          return new Uint8Array(buffer);
        }
      }
      console.log(`⚠️ Raw URL fetch failed: ${response2.status}`);

      // METHOD 4: Try with authenticated type
      const authUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        type: 'authenticated',
        sign_url: true,
      });
      
      console.log(`🔑 Trying authenticated URL: ${authUrl}`);
      const response3 = await fetch(authUrl);
      
      if (response3.ok) {
        const buffer = await response3.arrayBuffer();
        if (buffer.byteLength > 0) {
          console.log(`✅ Authenticated URL fetch successful: ${record.title} (${buffer.byteLength} bytes)`);
          return new Uint8Array(buffer);
        }
      }
      console.log(`⚠️ Authenticated URL fetch failed: ${response3.status}`);

      // METHOD 5: Try with a direct download link
      const downloadUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        type: 'upload',
        sign_url: true,
        attachment: true,
        flags: 'attachment',
        format: 'pdf',
      });
      
      console.log(`🔑 Trying download URL: ${downloadUrl}`);
      const response4 = await fetch(downloadUrl);
      
      if (response4.ok) {
        const buffer = await response4.arrayBuffer();
        if (buffer.byteLength > 0) {
          console.log(`✅ Download URL fetch successful: ${record.title} (${buffer.byteLength} bytes)`);
          return new Uint8Array(buffer);
        }
      }
      console.log(`⚠️ Download URL fetch failed: ${response4.status}`);

    } catch (err) {
      console.log(`⚠️ Cloudinary SDK error: ${err.message}`);
    }
  }

  console.log(`❌ All fetch methods failed for: ${record.title}`);
  return null;
}

// ─── Embed image page ─────────────────────────────────────────
async function embedImagePage(doc, bytes, kind) {
  try {
    let image;
    if (kind === 'png') {
      image = await doc.embedPng(bytes);
    } else {
      image = await doc.embedJpg(bytes);
    }
    const page = doc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const margin = 20;
    const maxW = width - margin * 2;
    const maxH = height - margin * 2;
    const scale = Math.min(maxW / image.width, maxH / image.height, 1);
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    page.drawImage(image, {
      x: (width - drawW) / 2,
      y: (height - drawH) / 2,
      width: drawW,
      height: drawH,
    });
  } catch (err) {
    console.error(`Failed to embed ${kind} image:`, err.message);
    throw err;
  }
}

// ─── Add placeholder page ─────────────────────────────────────
function addPlaceholderPage(doc, font, record, message) {
  const page = doc.addPage([595.28, 841.89]);
  page.drawText(record.title || "Attachment", {
    x: 40,
    y: 780,
    size: 16,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  page.drawText(`File: ${record.fileName || record.title || 'Unknown'}`, {
    x: 40,
    y: 750,
    size: 11,
    color: rgb(0.3, 0.3, 0.3),
  });
  page.drawText(`Status: ${message}`, {
    x: 40,
    y: 720,
    size: 12,
    color: rgb(0.5, 0.1, 0.1),
  });
  if (record.fileUrl) {
    page.drawText(`Download: ${record.fileUrl}`, {
      x: 40,
      y: 690,
      size: 9,
      color: rgb(0.2, 0.2, 0.8),
    });
  }
}

// ─── HTML Template ────────────────────────────────────────────
function generatePDFHTML(patient, doctor, visit, healthRecords, includeItems, generatedAt) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'Not specified';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const showAllergies = includeItems?.allergies !== false;
  const showFullReport = includeItems?.fullreport !== false;
  const showVaccination = includeItems?.vaccination !== false;
  const showDocNotes = includeItems?.docnotes !== false;

  let filteredRecords = healthRecords || [];
  if (!showFullReport) {
    const labReports = filteredRecords.filter(r => r.category === 'Lab Report').slice(0, 3);
    const prescriptions = filteredRecords.filter(r => r.category === 'Prescription').slice(0, 1);
    const vaccinations = showVaccination ? filteredRecords.filter(r => r.category === 'Vaccination') : [];
    const docNotes = showDocNotes ? filteredRecords.filter(r => r.category === 'Doctor Notes') : [];

    filteredRecords = [...labReports, ...prescriptions, ...vaccinations, ...docNotes];
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Health Summary - ${patient.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      background: white;
      padding: 40px;
      color: #1a1a2e;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      padding: 40px;
    }
    .header {
      text-align: center;
      padding-bottom: 30px;
      border-bottom: 2px solid #e8e8e8;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .header .subtitle {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
      border-bottom: 2px solid #e8e8e8;
      padding-bottom: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title .icon {
      font-size: 20px;
    }
    .row {
      display: flex;
      padding: 6px 0;
      border-bottom: 1px solid #f5f5f5;
    }
    .row:last-child { border-bottom: none; }
    .label {
      width: 140px;
      flex-shrink: 0;
      color: #666;
      font-size: 13px;
      font-weight: 500;
    }
    .value {
      flex: 1;
      font-size: 13px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .badge {
      display: inline-block;
      padding: 2px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      background: #e8f5e9;
      color: #2e7d32;
    }
    .records-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .record-card {
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      padding: 12px 16px;
      background: #fafafa;
    }
    .record-card .title {
      font-weight: 600;
      font-size: 13px;
      color: #1a1a2e;
      margin-bottom: 4px;
    }
    .record-card .meta {
      font-size: 11px;
      color: #666;
    }
    .record-card .category {
      display: inline-block;
      padding: 1px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
      background: #e3f2fd;
      color: #1565c0;
      margin-top: 4px;
    }
    .record-card .category.prescription { background: #fff3e0; color: #e65100; }
    .record-card .category.scan { background: #fce4ec; color: #c62828; }
    .record-card .category.vaccination { background: #e8f5e9; color: #2e7d32; }
    .record-card .category.lab { background: #e3f2fd; color: #1565c0; }
    .record-card .category.other { background: #f3e5f5; color: #6a1b9a; }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e8e8e8;
      text-align: center;
      color: #999;
      font-size: 11px;
    }
    .doctor-info {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin-top: 8px;
    }
    .doctor-info .doctor-name {
      font-size: 16px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .doctor-info .doctor-specialty {
      color: #666;
      font-size: 13px;
    }
    @media print {
      body { padding: 20px; }
      .container { box-shadow: none; padding: 20px; }
      .record-card { break-inside: avoid; }
    }
    @media (max-width: 600px) {
      .records-grid { grid-template-columns: 1fr; }
      .row { flex-direction: column; padding: 8px 0; }
      .label { width: 100%; margin-bottom: 2px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 Health Summary</h1>
      <p class="subtitle">Generated on ${new Date(generatedAt).toLocaleString()}</p>
    </div>

    <div class="section">
      <div class="section-title">
        <span class="icon">👤</span> Patient Information
      </div>
      <div class="row">
        <span class="label">Name</span>
        <span class="value">${patient.name || 'N/A'}</span>
      </div>
      <div class="row">
        <span class="label">Age</span>
        <span class="value">${patient.age || 'N/A'} years</span>
      </div>
      <div class="row">
        <span class="label">Gender</span>
        <span class="value">${patient.gender || 'N/A'}</span>
      </div>
      <div class="row">
        <span class="label">Blood Group</span>
        <span class="value">${patient.bloodGroup || 'N/A'}</span>
      </div>
      ${showAllergies ? `
      <div class="row">
        <span class="label">Allergies</span>
        <span class="value">${patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None reported'}</span>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <div class="section-title">
        <span class="icon">👨‍⚕️</span> Doctor Information
      </div>
      <div class="doctor-info">
        <div class="doctor-name">${doctor.name || 'Not specified'}</div>
        <div class="doctor-specialty">${doctor.specialty || 'N/A'}</div>
        ${doctor.hospital ? `<div style="color:#666;font-size:12px;margin-top:4px;">🏥 ${doctor.hospital}</div>` : ''}
        ${doctor.city ? `<div style="color:#666;font-size:12px;">📍 ${doctor.city}</div>` : ''}
        ${doctor.consultationFee > 0 ? `<div style="color:#666;font-size:12px;">💰 ₹${doctor.consultationFee} consultation fee</div>` : ''}
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        <span class="icon">📅</span> Visit Details
      </div>
      <div class="row">
        <span class="label">Date</span>
        <span class="value">${visit.date ? formatDate(visit.date) : 'Not specified'}</span>
      </div>
      <div class="row">
        <span class="label">Time</span>
        <span class="value">${visit.time ? formatTime(visit.time) : 'Not specified'}</span>
      </div>
      <div class="row">
        <span class="label">Reason</span>
        <span class="value">${visit.reason || 'Not specified'}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">
        <span class="icon">📋</span> Health Records
      </div>
      ${filteredRecords.length > 0 ? `
        <div class="records-grid">
          ${filteredRecords.map(record => `
            <div class="record-card">
              <div class="title">${record.title || 'Untitled'}</div>
              <div class="meta">${record.date || 'No date'} • ${record.member || 'Unknown'}</div>
              <span class="category ${record.category?.toLowerCase() || 'lab'}">${record.category || 'General'}</span>
              ${record.doctor ? `<div style="font-size:10px;color:#666;margin-top:4px;">👨‍⚕️ ${record.doctor}</div>` : ''}
            </div>
          `).join('')}
        </div>
        <p style="color:#999;font-size:11px;margin-top:10px;">Full documents for each record above are attached as additional pages of this PDF.</p>
      ` : `
        <p style="color:#999;font-size:13px;text-align:center;padding:20px 0;">No health records found for this patient.</p>
      `}
    </div>

    <div class="footer">
      <p>Generated by Family Health • This document is for informational purposes only</p>
      <p style="margin-top:4px;">Please consult your healthcare provider for medical advice</p>
    </div>
  </div>
</body>
</html>
  `;
}