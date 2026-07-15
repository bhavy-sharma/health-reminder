import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Share from "@/models/Share";

export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);

    if (!auth || !auth.authenticated) {
      return NextResponse.json(
        { error: "Please login" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { patient, doctor, visit, familyId, memberId } = body;

    // Create the share document
    const shareDoc = new Share({
      familyId: familyId,
      memberId: memberId,
      patient: {
        name: patient?.name || 'Unknown',
        age: patient?.age || 'N/A',
        gender: patient?.gender || 'N/A',
        bloodGroup: patient?.bloodGroup || 'N/A',
        allergies: patient?.allergies || [],
      },
      doctor: {
        name: doctor?.name || 'Not specified',
        specialty: doctor?.specialty || 'N/A',
        hospital: doctor?.hospital || 'N/A',
        city: doctor?.city || 'N/A',
        consultationFee: doctor?.consultationFee || 0,
      },
      visit: {
        date: visit?.date || 'Not specified',
        time: visit?.time || 'Not specified',
        reason: visit?.reason || 'Not specified',
      },
      generatedAt: new Date().toISOString(),
    });

    await shareDoc.save();

    // Return the actual share ID (the _id from the database)
    return NextResponse.json({
      success: true,
      shareId: shareDoc._id.toString(),
    });

  } catch (error) {
    console.error('Error creating shareable link:', error);
    return NextResponse.json(
      { error: error.message || "Failed to create shareable link" },
      { status: 500 }
    );
  }
}