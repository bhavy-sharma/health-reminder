// app/api/health-records/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import HealthRecord from "@/models/HealthRecord";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";

export async function GET(request) {
  try {
    console.log('Health Records API: Starting request...');
    
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

    // 4. Check role - ONLY PATIENTS can access health records
    if (auth.role !== 'patient') {
      return NextResponse.json(
        { 
          error: "Access denied", 
          message: "Only patients can access health records" 
        }, 
        { status: 403 }
      );
    }

    // 5. Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");
    const memberId = searchParams.get("memberId");
    const documentType = searchParams.get("documentType");
    const search = searchParams.get("search");

    if (!familyId) {
      return NextResponse.json({ error: "Family ID is required" }, { status: 400 });
    }

    // Check if user belongs to this family
    const user = await User.findById(auth.userId);
    const hasAccess = user?.families?.some(f => f.familyId.toString() === familyId);
    
    if (!hasAccess) {
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

    return NextResponse.json({ 
      success: true,
      records: filteredRecords,
      total: filteredRecords.length,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching health records:", error);
    return NextResponse.json(
      { error: "Failed to fetch health records" },
      { status: 500 }
    );
  }
}

// ── POST: Create new health record ───────────────────────────

export async function POST(request) {
  try {
    console.log('Health Records API POST: Starting request...');
    
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

    // 4. Check role - ONLY PATIENTS can create health records
    if (auth.role !== 'patient') {
      return NextResponse.json(
        { 
          error: "Access denied", 
          message: "Only patients can create health records" 
        }, 
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { 
      familyId, 
      memberId, 
      documentName, 
      documentType, 
      documentDate, 
      notes,
      fileUrl,
      filePublicId,
      fileSizeKB,
      mimeType,
    } = body;

    // Validate required fields
    if (!familyId || !memberId || !documentName || !documentType || !documentDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user belongs to this family
    const user = await User.findById(auth.userId);
    const hasAccess = user?.families?.some(f => f.familyId.toString() === familyId);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have access to this family" },
        { status: 403 }
      );
    }

    // Create health record
    const healthRecord = new HealthRecord({
      familyId,
      memberId,
      documentName,
      documentType,
      documentDate: new Date(documentDate),
      notes: notes || '',
      fileUrl: fileUrl || '',
      filePublicId: filePublicId || '',
      fileSizeKB: fileSizeKB || 0,
      mimeType: mimeType || '',
      uploadedBy: auth.userId,
      isActive: true,
    });

    await healthRecord.save();

    return NextResponse.json({
      success: true,
      message: "Health record created successfully",
      data: healthRecord,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating health record:", error);
    return NextResponse.json(
      { error: "Failed to create health record" },
      { status: 500 }
    );
  }
}

// ── PUT: Update health record ───────────────────────────────

export async function PUT(request) {
  try {
    console.log('Health Records API PUT: Starting request...');
    
    // 1. Get authenticated user
    const auth = await getAuthenticatedUser(request);
    
    // 2. Check authentication
    if (!auth || !auth.authenticated) {
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

    // 4. Check role - ONLY PATIENTS can update health records
    if (auth.role !== 'patient') {
      return NextResponse.json(
        { 
          error: "Access denied", 
          message: "Only patients can update health records" 
        }, 
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("id");

    if (!recordId) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { documentName, documentType, documentDate, notes, isActive } = body;

    // Find the record
    const record = await HealthRecord.findById(recordId);
    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this record
    const user = await User.findById(auth.userId);
    const hasAccess = user?.families?.some(f => f.familyId.toString() === record.familyId.toString());
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have access to this record" },
        { status: 403 }
      );
    }

    // Update record
    if (documentName) record.documentName = documentName;
    if (documentType) record.documentType = documentType;
    if (documentDate) record.documentDate = new Date(documentDate);
    if (notes !== undefined) record.notes = notes;
    if (isActive !== undefined) record.isActive = isActive;

    await record.save();

    return NextResponse.json({
      success: true,
      message: "Health record updated successfully",
      data: record,
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating health record:", error);
    return NextResponse.json(
      { error: "Failed to update health record" },
      { status: 500 }
    );
  }
}

// ── DELETE: Delete health record ─────────────────────────────

export async function DELETE(request) {
  try {
    console.log('Health Records API DELETE: Starting request...');
    
    // 1. Get authenticated user
    const auth = await getAuthenticatedUser(request);
    
    // 2. Check authentication
    if (!auth || !auth.authenticated) {
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

    // 4. Check role - ONLY PATIENTS can delete health records
    if (auth.role !== 'patient') {
      return NextResponse.json(
        { 
          error: "Access denied", 
          message: "Only patients can delete health records" 
        }, 
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("id");

    if (!recordId) {
      return NextResponse.json(
        { error: "Record ID is required" },
        { status: 400 }
      );
    }

    // Find the record
    const record = await HealthRecord.findById(recordId);
    if (!record) {
      return NextResponse.json(
        { error: "Record not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this record
    const user = await User.findById(auth.userId);
    const hasAccess = user?.families?.some(f => f.familyId.toString() === record.familyId.toString());
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have access to this record" },
        { status: 403 }
      );
    }

    // Soft delete by setting isActive to false
    record.isActive = false;
    await record.save();

    return NextResponse.json({
      success: true,
      message: "Health record deleted successfully",
    }, { status: 200 });
  } catch (error) {
    console.error("Error deleting health record:", error);
    return NextResponse.json(
      { error: "Failed to delete health record" },
      { status: 500 }
    );
  }
}

// ── Helper Functions ──────────────────────────────────────────

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