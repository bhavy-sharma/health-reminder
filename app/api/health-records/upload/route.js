import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import HealthRecord from "@/models/HealthRecord";
import Family from "@/models/Family";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("file");
    const familyId = formData.get("familyId");
    const memberId = formData.get("memberId");
    const documentName = formData.get("documentName");
    const documentType = formData.get("documentType");
    const documentDate = formData.get("documentDate");
    const notes = formData.get("notes") || "";

    // Validate required fields
    if (!file || !familyId || !memberId || !documentName || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File must be JPEG, PNG, or PDF" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Check if user has access to this family
    const user = await User.findById(decoded.userId);
    const hasAccess = user.families?.some(f => f.familyId.toString() === familyId);
    
    if (!hasAccess && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have access to this family" },
        { status: 403 }
      );
    }

    // Check if family exists
    const family = await Family.findById(familyId);
    if (!family) {
      return NextResponse.json(
        { error: "Family not found" },
        { status: 404 }
      );
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type - PDFs need "raw", images use "image"
    const isPDF = file.type === "application/pdf";
    const resourceType = isPDF ? "raw" : "image";

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `health-records/${familyId}`,
          resource_type: resourceType,  // "raw" for PDF, "image" for images
          type: "upload",
          access_mode: "public",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Create health record
    const record = await HealthRecord.create({
      familyId,
      memberId,
      documentName,
      documentType,
      fileUrl: uploadResult.secure_url,
      filePublicId: uploadResult.public_id,
      fileSizeKB: Math.round(file.size / 1024),
      mimeType: file.type,
      documentDate: documentDate ? new Date(documentDate) : new Date(),
      notes,
      uploadedBy: user._id,
    });

    // Update family storage
    family.storageUsed = (family.storageUsed || 0) + Math.round(file.size / (1024 * 1024 * 1024) * 100) / 100;
    await family.save();

    return NextResponse.json(
      {
        message: "Record uploaded successfully",
        record: {
          id: record._id,
          documentName: record.documentName,
          fileUrl: record.fileUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading health record:", error);
    return NextResponse.json(
      { error: "Failed to upload health record" },
      { status: 500 }
    );
  }
}