// app/api/admin/queries/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Query from "@/models/Query";
import User from "@/models/User";

// GET: Fetch single query
export async function GET(request, { params }) {
  try {
    const validation = await validateUserRole(request, 'admin');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, message: validation.message },
        { status: validation.status }
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

// PUT: Admin reply to query
export async function PUT(request, { params }) {
  try {
    const validation = await validateUserRole(request, 'admin');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, message: validation.message },
        { status: validation.status }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { message, status, attachments } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Reply message is required" },
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

    // Get admin user
    const admin = await User.findById(validation.user.userId);

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

    // Add admin reply to conversation
    query.conversation.push({
      sender: "admin",
      senderId: validation.user.userId,
      senderName: admin?.name || 'Admin',
      message: message.trim(),
      attachments: formattedAttachments,
      sentAt: new Date(),
    });

    // Update query status if provided
    if (status && ["open", "in_progress", "resolved", "closed"].includes(status)) {
      query.status = status;
    } else {
      // Default: mark as in_progress when admin replies
      query.status = "in_progress";
    }

    // Set admin reply
    query.adminReply = {
      message: message.trim(),
      repliedAt: new Date(),
      repliedBy: validation.user.userId,
    };

    await query.save();

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      data: query,
    });
  } catch (error) {
    console.error("Error replying to query:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reply to query" },
      { status: 500 }
    );
  }
}

// PATCH: Update query status
export async function PATCH(request, { params }) {
  try {
    const validation = await validateUserRole(request, 'admin');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, message: validation.message },
        { status: validation.status }
      );
    }

    await connectToDatabase();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["open", "in_progress", "resolved", "closed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
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

    query.status = status;

    if (status === "resolved") {
      query.resolvedAt = new Date();
    } else if (status === "closed") {
      query.closedAt = new Date();
      query.closedBy = "admin";
    }

    await query.save();

    return NextResponse.json({
      success: true,
      message: `Query status updated to ${status}`,
      data: query,
    });
  } catch (error) {
    console.error("Error updating query status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update query status" },
      { status: 500 }
    );
  }
}