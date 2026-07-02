import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ReminderLog from "@/models/ReminderLog";
import MedicineReminder from "@/models/MedicineReminder";
import { getAuthenticatedUser } from "@/lib/auth";

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

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching reminder history:", error);
    return NextResponse.json({ error: "Failed to fetch reminder history" }, { status: 500 });
  }
}
