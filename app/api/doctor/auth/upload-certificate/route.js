// app/api/doctor/auth/upload-certificate/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("certificate");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          error: "Invalid file type. Please upload JPEG, PNG, GIF, WEBP, or PDF files only." 
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine if it's a PDF
    const isPDF = file.type === "application/pdf";
    const isImage = file.type.startsWith('image/');

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions = {
        folder: "doctor-certificates",
        public_id: `doctor-certificates/${Date.now()}-${file.name.split('.')[0]}`,
        allowed_formats: ["jpg", "jpeg", "png", "pdf", "gif", "webp"],
        // Make files publicly accessible
        access_mode: "public",
        // For PDFs, use raw resource type to avoid authentication issues
        resource_type: isPDF ? "raw" : "auto",
        // For images, add transformations for better display
        ...(isImage && {
          transformation: [
            { quality: "auto" },
            { fetch_format: "auto" }
          ]
        })
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    // For PDFs, the URL might need to be accessed differently
    let finalUrl = uploadResult.secure_url;
    
    // If it's a PDF uploaded as raw, we might need to add a .pdf extension
    if (isPDF && !finalUrl.endsWith('.pdf')) {
      // The raw URL is correct, just use it as is
      console.log('PDF uploaded as raw:', finalUrl);
    }

    return NextResponse.json({
      success: true,
      data: {
        url: finalUrl,
        publicId: uploadResult.public_id,
        fileName: file.name,
        fileType: file.type,
        resourceType: isPDF ? "raw" : "auto",
      },
    });
  } catch (error) {
    console.error("Certificate upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload certificate" },
      { status: 500 }
    );
  }
}