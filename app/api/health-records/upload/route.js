// app/api/health-records/upload/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import HealthRecord from "@/models/HealthRecord";
import Family from "@/models/Family";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    await connectToDatabase();

    // 1. Get authenticated user
    const auth = await getAuthenticatedUser(request);
    
    // 2. Check authentication
    if (!auth || !auth.authenticated) {
      if (auth?.isSuspended) {
        return NextResponse.json(
          { 
            error: "Account suspended", 
            reason: auth.suspendedReason || "Contact support" 
          }, 
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Please login to continue" }, 
        { status: 401 }
      );
    }

    // 3. Check suspension
    if (auth.isSuspended) {
      return NextResponse.json(
        { 
          error: "Account suspended", 
          reason: auth.suspendedReason || "Contact support" 
        }, 
        { status: 403 }
      );
    }

    // 4. Check role - ONLY PATIENTS can upload health records
    if (auth.role !== 'patient') {
      return NextResponse.json(
        { 
          error: "Access denied", 
          message: "Only patients can upload health records" 
        }, 
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const familyId = formData.get("familyId");
    const memberId = formData.get("memberId");
    const documentName = formData.get("documentName");
    const documentType = formData.get("documentType");
    const documentDate = formData.get("documentDate");
    const doctorName = formData.get("doctorName") || "";
    const hospitalName = formData.get("hospitalName") || "";
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
    const user = await User.findById(auth.userId);
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

    // ─── CHECK USER STORAGE LIMIT ───
    const fileSizeInGB = file.size / (1024 * 1024 * 1024);
    const remainingStorage = user.storageLimit - user.storageUsed;

    console.log('Storage check:', {
      plan: user.plan,
      storageLimit: user.storageLimit,
      storageUsed: user.storageUsed,
      remaining: remainingStorage,
      fileSizeGB: fileSizeInGB,
    });

    if (remainingStorage < fileSizeInGB) {
      return NextResponse.json(
        { 
          error: "Storage limit exceeded", 
          message: `You have used ${user.storageUsed.toFixed(2)} GB of ${user.storageLimit} GB. This file requires ${fileSizeInGB.toFixed(2)} GB of space. Please upgrade your plan or delete some files.`,
          storageUsed: user.storageUsed,
          storageLimit: user.storageLimit,
          remainingStorage: remainingStorage,
          fileSize: fileSizeInGB,
          plan: user.plan,
          code: "STORAGE_LIMIT_EXCEEDED"
        },
        { status: 413 }
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
          resource_type: resourceType,
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
      doctorName,
      hospitalName,
      notes,
      uploadedBy: user._id,
    });

    // ─── UPDATE USER STORAGE ───
    user.storageUsed = (user.storageUsed || 0) + fileSizeInGB;
    await user.save();

    // ─── UPDATE FAMILY STORAGE (for display purposes) ───
    family.storageUsed = (family.storageUsed || 0) + fileSizeInGB;
    await family.save();

    console.log('Storage updated:', {
      userId: user._id,
      userStorageUsed: user.storageUsed,
      userStorageLimit: user.storageLimit,
      familyStorageUsed: family.storageUsed,
    });

    return NextResponse.json(
      {
        message: "Record uploaded successfully",
        record: {
          id: record._id,
          documentName: record.documentName,
          fileUrl: record.fileUrl,
        },
        storage: {
          used: user.storageUsed,
          limit: user.storageLimit,
          remaining: user.storageLimit - user.storageUsed,
          percentageUsed: (user.storageUsed / user.storageLimit) * 100,
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