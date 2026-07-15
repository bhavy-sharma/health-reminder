// app/api/admin/queries/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Query from "@/models/Query";

export async function GET(request) {
  try {
    // Use validateUserRole with 'admin' role
    const validation = await validateUserRole(request, 'admin');
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, message: validation.message },
        { status: validation.status }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";
    const priority = searchParams.get("priority") || "all";
    const search = searchParams.get("search") || "";
    const createdBy = searchParams.get("createdBy") || "all"; // 'doctor', 'patient', or 'all'
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status !== "all") query.status = status;
    if (category !== "all") query.category = category;
    if (priority !== "all") query.priority = priority;
    if (createdBy !== "all") query.createdBy = createdBy;

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { doctorName: { $regex: search, $options: "i" } },
        { doctorEmail: { $regex: search, $options: "i" } },
        { patientName: { $regex: search, $options: "i" } },
        { patientEmail: { $regex: search, $options: "i" } },
      ];
    }

    const [queries, total] = await Promise.all([
      Query.find(query)
        .sort({ 
          priority: 1, // urgent first
          createdAt: -1 
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Query.countDocuments(query),
    ]);

    // Get counts for filters
    const counts = {
      all: await Query.countDocuments(),
      open: await Query.countDocuments({ status: "open" }),
      in_progress: await Query.countDocuments({ status: "in_progress" }),
      resolved: await Query.countDocuments({ status: "resolved" }),
      closed: await Query.countDocuments({ status: "closed" }),
    };

    // Get category counts
    const categoryCounts = {
      technical: await Query.countDocuments({ category: "technical" }),
      billing: await Query.countDocuments({ category: "billing" }),
      account: await Query.countDocuments({ category: "account" }),
      feature_request: await Query.countDocuments({ category: "feature_request" }),
      verification: await Query.countDocuments({ category: "verification" }),
      patient_care: await Query.countDocuments({ category: "patient_care" }),
      general: await Query.countDocuments({ category: "general" }),
    };

    // Get counts by creator type
    const creatorCounts = {
      doctor: await Query.countDocuments({ createdBy: "doctor" }),
      patient: await Query.countDocuments({ createdBy: "patient" }),
    };

    return NextResponse.json({
      success: true,
      data: {
        queries,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        counts,
        categoryCounts,
        creatorCounts,
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