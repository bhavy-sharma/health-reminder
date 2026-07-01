import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import HealthRecord from "@/models/HealthRecord";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");
    const memberId = searchParams.get("memberId");
    const documentType = searchParams.get("documentType");
    const search = searchParams.get("search");

    if (!familyId) {
      return NextResponse.json({ error: "Family ID is required" }, { status: 400 });
    }

    // Check if user belongs to this family
    const user = await User.findById(decoded.userId);
    const hasAccess = user.families?.some(f => f.familyId.toString() === familyId);
    
    if (!hasAccess && user.role !== "admin") {
      return NextResponse.json(
        { error: "You do not have access to this family" },
        { status: 403 }
      );
    }

    // Build query
    const query = { familyId, isActive: true };
    
    if (memberId) {
      query.memberId = memberId;
    }
    
    if (documentType && documentType !== "All Records") {
      const typeMap = {
        "Lab Reports": "lab_report",
        "Prescriptions": "prescription",
        "Scans": "xray_scan",
        "Vaccinations": "vaccination",
        "Doctor Notes": "other",
      };
      query.documentType = typeMap[documentType] || documentType.toLowerCase().replace(" ", "_");
    }

    // Get records with populated member info
    const records = await HealthRecord.find(query)
      .sort({ documentDate: -1, createdAt: -1 })
      .populate("memberId", "name relationship avatarColor")
      .populate("uploadedBy", "fullName");

    // Format response
    const formattedRecords = records.map(record => ({
      id: record._id,
      category: getCategoryLabel(record.documentType),
      title: record.documentName,
      member: record.memberId?.name || "Unknown",
      memberId: record.memberId?._id,
      date: new Date(record.documentDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      doctor: record.notes || "No additional notes",
      type: getIconType(record.documentType),
      fileUrl: record.fileUrl,
      filePublicId: record.filePublicId,
      fileSizeKB: record.fileSizeKB,
      mimeType: record.mimeType,
      notes: record.notes,
    }));

    // Apply search filter if provided
    let filteredRecords = formattedRecords;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecords = formattedRecords.filter(r =>
        r.title.toLowerCase().includes(searchLower) ||
        r.member.toLowerCase().includes(searchLower) ||
        r.doctor.toLowerCase().includes(searchLower) ||
        r.date.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({ records: filteredRecords }, { status: 200 });
  } catch (error) {
    console.error("Error fetching health records:", error);
    return NextResponse.json(
      { error: "Failed to fetch health records" },
      { status: 500 }
    );
  }
}

function getCategoryLabel(type) {
  const map = {
    lab_report: "Lab Report",
    prescription: "Prescription",
    xray_scan: "Scan",
    vaccination: "Vaccination",
    insurance: "Insurance",
    other: "Doctor Notes",
  };
  return map[type] || type;
}

function getIconType(type) {
  const map = {
    lab_report: "lab",
    prescription: "prescription",
    xray_scan: "scan",
    vaccination: "lab",
    insurance: "lab",
    other: "prescription",
  };
  return map[type] || "lab";
}