// app/api/patient/queries/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Query from "@/models/Query";
import User from "@/models/User";

// GET: Fetch patient's queries
export async function GET(request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login to continue" },
        { status: 401 }
      );
    }

    if (auth.role !== 'patient') {
      return NextResponse.json(
        { error: "Access denied. Patient access required." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // Find patient
    let patient = await User.findOne({ email: auth.email });
    if (!patient) {
      patient = await User.findById(auth.userId);
    }

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Build query
    const query = { patientId: patient._id };
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
    console.error("Error fetching patient queries:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch queries" },
      { status: 500 }
    );
  }
}

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

    if (auth.role !== 'patient') {
      return NextResponse.json(
        { error: "Access denied. Patient access required." },
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

    // Find patient
    let patient = await User.findOne({ email: auth.email });
    if (!patient) {
      patient = await User.findById(auth.userId);
    }

    if (!patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
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

    // Create query with properly formatted data (matching doctor pattern)
    const query = new Query({
      patientId: patient._id,
      patientName: patient.name || patient.fullName || 'Patient',
      patientEmail: patient.email,
      patientPhone: patient.phone || '',
      subject: subject.trim(),
      message: message.trim(),
      category: category || "general",
      priority: priority || "medium",
      status: "open",
      createdBy: "patient",
      attachments: formattedAttachments,
      conversation: [
        {
          sender: "patient",
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
    console.error("Error creating patient query:", error);
    
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