import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import HealthRecord from "@/models/HealthRecord";
import Family from "@/models/Family";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request, { params }) {
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

    const { id } = await params;

    const record = await HealthRecord.findById(id);
    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Check if user has access
    const user = await User.findById(decoded.userId);
    const hasAccess = user.families?.some(f => f.familyId.toString() === record.familyId.toString());
    
    if (!hasAccess && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have access to this record" },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(record.filePublicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
    }

    // Soft delete
    record.isActive = false;
    await record.save();

    return NextResponse.json(
      { message: "Record deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting health record:", error);
    return NextResponse.json(
      { error: "Failed to delete health record" },
      { status: 500 }
    );
  }
}