import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ReminderLog from "@/models/ReminderLog";
import MedicineReminder from "@/models/MedicineReminder";
import { getAuthenticatedUser } from "@/lib/auth";
import { formatTo12Hour } from "@/lib/timeUtils";

export async function GET(request) {
  try {
    await connectToDatabase();
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    if (!familyId) {
      return NextResponse.json({ error: "Family ID is required" }, { status: 400 });
    }

    // Find all reminders in this family
    const reminders = await MedicineReminder.find({ familyId });
    const reminderIds = reminders.map(r => r._id);

    // Query logs associated with those reminders
    let query = { reminderId: { $in: reminderIds } };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.medicineName = { $regex: search, $options: "i" };
    }

    const logs = await ReminderLog.find(query)
      .populate("memberId")
      .sort({ scheduledTime: -1 });

    // Format response with formatted times
    const formattedLogs = logs.map(log => {
      const logObj = log.toObject();
      // Find the associated reminder to get the formatted time
      const reminder = reminders.find(r => r._id.toString() === log.reminderId.toString());
      return {
        ...logObj,
        reminderTime: reminder ? formatTo12Hour(reminder.reminderTime) : null
      };
    });

    return NextResponse.json({ logs: formattedLogs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reminder history:", error);
    return NextResponse.json({ error: "Failed to fetch reminder history" }, { status: 500 });
  }
}