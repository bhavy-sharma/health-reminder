import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ReminderLog from "@/models/ReminderLog";
import MedicineReminder from "@/models/MedicineReminder";
import FamilyMember from "@/models/FamilyMember";

// POST: Simulate an incoming WhatsApp response from a patient (e.g. TAKEN or SKIP)
export async function POST(request) {
  try {
    await connectToDatabase();
    const { logId, responseType } = await request.json(); // responseType: 'TAKEN' or 'SKIP'

    if (!logId || !responseType) {
      return NextResponse.json({ error: "Missing logId or responseType" }, { status: 400 });
    }

    const log = await ReminderLog.findById(logId).populate("memberId");
    if (!log) {
      return NextResponse.json({ error: "Reminder log not found" }, { status: 404 });
    }

    // Update status
    log.status = responseType === 'TAKEN' ? 'Taken' : 'Skipped';
    log.takenAt = responseType === 'TAKEN' ? new Date() : null;
    await log.save();

    // Push real-time event to notifications
    if (!global.simulatedNotifications) {
      global.simulatedNotifications = [];
    }

    const memberName = log.memberId?.name || "Member";
    global.simulatedNotifications.unshift({
      id: Math.random().toString(36).substr(2, 9),
      type: responseType === 'TAKEN' ? 'Medicine Taken' : 'Medicine Skipped',
      message: `${memberName} marked ${log.medicineName} as ${responseType}`,
      timestamp: new Date()
    });

    return NextResponse.json({ success: true, log }, { status: 200 });

  } catch (error) {
    console.error("Error processing incoming reply:", error);
    return NextResponse.json({ error: "Failed to process reply", details: error.message }, { status: 500 });
  }
}
