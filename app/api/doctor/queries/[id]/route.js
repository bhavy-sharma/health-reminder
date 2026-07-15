// app/api/doctor/queries/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Query from "@/models/Query";
import Doctor from "@/models/Doctor";

// GET: Fetch a single query
export async function GET(request, { params }) {
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

    const { id } = await params;
    const query = await Query.findById(id).lean();

    if (!query) {
      return NextResponse.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    // Verify doctor owns this query
    const doctor = await Doctor.findOne({ email: auth.email });
    if (!doctor || query.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to view this query" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: query,
    });
  } catch (error) {
    console.error("Error fetching query:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch query" },
      { status: 500 }
    );
  }
}

// PUT: Reply to query (doctor adds to conversation)
// PUT: Reply to query (doctor adds to conversation)
export async function PUT(request, { params }) {
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

    const { id } = await params;
    const body = await request.json();
    const { message, attachments } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const query = await Query.findById(id);

    if (!query) {
      return NextResponse.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    // Verify doctor owns this query
    const doctor = await Doctor.findOne({ email: auth.email });
    if (!doctor || query.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update this query" },
        { status: 403 }
      );
    }

    // Check if query is closed or resolved
    if (query.status === "closed") {
      return NextResponse.json(
        { 
          error: "This query is closed and cannot be replied to",
          code: "QUERY_CLOSED"
        },
        { status: 403 }
      );
    }

    if (query.status === "resolved") {
      return NextResponse.json(
        { 
          error: "This query is resolved and cannot be replied to. Please reopen it first.",
          code: "QUERY_RESOLVED"
        },
        { status: 403 }
      );
    }

    // Format attachments
    const formattedAttachments = attachments && Array.isArray(attachments) 
      ? attachments.map(file => ({
          name: file.name || 'file',
          url: file.url || '',
          size: file.size || 0,
          type: file.type || 'application/octet-stream',
          publicId: file.publicId || '',
        }))
      : [];

    // Add to conversation
    query.conversation.push({
      sender: "doctor",
      message: message.trim(),
      attachments: formattedAttachments,
      sentAt: new Date(),
    });

    // If query was resolved, reopen it
    if (query.status === "resolved") {
      query.status = "open";
    }

    await query.save();

    return NextResponse.json({
      success: true,
      message: "Reply added successfully",
      data: query,
    });
  } catch (error) {
    console.error("Error updating query:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update query" },
      { status: 500 }
    );
  }
}

// PATCH: Close or resolve query
export async function PATCH(request, { params }) {
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

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'resolve' or 'close'

    const query = await Query.findById(id);

    if (!query) {
      return NextResponse.json(
        { error: "Query not found" },
        { status: 404 }
      );
    }

    // Verify doctor owns this query
    const doctor = await Doctor.findOne({ email: auth.email });
    if (!doctor || query.doctorId.toString() !== doctor._id.toString()) {
      return NextResponse.json(
        { error: "You don't have permission to update this query" },
        { status: 403 }
      );
    }

    // ─── FIX: Don't allow closing if already closed ───
    if (query.status === "closed" && action !== "reopen") {
      return NextResponse.json(
        { 
          error: "This query is already closed",
          code: "QUERY_ALREADY_CLOSED"
        },
        { status: 403 }
      );
    }

    if (action === "resolve") {
      // ─── Only resolve if not closed ───
      if (query.status === "closed") {
        return NextResponse.json(
          { 
            error: "Cannot resolve a closed query. Please reopen it first.",
            code: "QUERY_CLOSED_CANNOT_RESOLVE"
          },
          { status: 403 }
        );
      }
      query.status = "resolved";
      query.resolvedAt = new Date();
    } else if (action === "close") {
      query.status = "closed";
      query.closedAt = new Date();
      query.closedBy = "doctor";
    } else if (action === "reopen") {
      query.status = "open";
      query.resolvedAt = null;
      query.closedAt = null;
      query.closedBy = null;
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'resolve', 'close', or 'reopen'" },
        { status: 400 }
      );
    }

    await query.save();

    return NextResponse.json({
      success: true,
      message: `Query ${action === 'reopen' ? 'reopened' : action + 'ed'} successfully`,
      data: query,
    });
  } catch (error) {
    console.error("Error updating query:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update query" },
      { status: 500 }
    );
  }
}