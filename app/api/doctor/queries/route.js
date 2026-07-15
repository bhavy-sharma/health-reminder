// app/api/doctor/queries/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Query from "@/models/Query";
import Doctor from "@/models/Doctor";

// GET: Fetch doctor's queries
export async function GET(request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    if (auth.role !== 'doctor') {
      return NextResponse.json(
        { error: "Access denied. Doctor access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Find doctor
    let doctor = await Doctor.findOne({ email: auth.email });
    if (!doctor) {
      doctor = await Doctor.findById(auth.userId);
    }

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Build query
    const query = { doctorId: doctor._id };
    if (status !== "all") {
      query.status = status;
    }

    const [queries, total] = await Promise.all([
      Query.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Query.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        queries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching queries:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch queries" },
      { status: 500 }
    );
  }
}

// POST: Create a new query
// POST: Create a new query
export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    if (auth.role !== 'doctor') {
      return NextResponse.json(
        { error: "Access denied. Doctor access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { subject, message, category, priority, attachments } = body;

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Find doctor
    let doctor = await Doctor.findOne({ email: auth.email });
    if (!doctor) {
      doctor = await Doctor.findById(auth.userId);
    }

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor profile not found" },
        { status: 404 }
      );
    }

    // Prepare attachments - ensure they're properly formatted
    const formattedAttachments = attachments && Array.isArray(attachments) 
      ? attachments.map(file => ({
          name: file.name || 'file',
          url: file.url || '',
          size: file.size || 0,
          type: file.type || 'application/octet-stream',
          publicId: file.publicId || '',
        }))
      : [];

    // Create query with properly formatted data
    const query = new Query({
      doctorId: doctor._id,
      doctorName: doctor.name || doctor.fullName || 'Doctor',
      doctorEmail: doctor.email,
      subject: subject.trim(),
      message: message.trim(),
      category: category || "general",
      priority: priority || "medium",
      status: "open",
      attachments: formattedAttachments,
      conversation: [
        {
          sender: "doctor",
          message: message.trim(),
          attachments: formattedAttachments,
          sentAt: new Date(),
        },
      ],
    });

    await query.save();

    return NextResponse.json({
      success: true,
      message: "Query submitted successfully",
      data: query,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating query:", error);
    
    // Log the validation errors details
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create query" },
      { status: 500 }
    );
  }
}