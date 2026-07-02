import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MedicineReminder from "@/models/MedicineReminder";
import ReminderLog from "@/models/ReminderLog";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth";

// GET: Fetch active reminders and calculate today's statistics
export async function GET(request) {
  try {
    await connectToDatabase();
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get("familyId");
    if (!familyId) {
      return NextResponse.json({ error: "Family ID is required" }, { status: 400 });
    }

    // 1. Fetch active reminders
    const reminders = await MedicineReminder.find({ familyId, isActive: true }).populate("memberId");

    // 2. Fetch logs for today to compile stats
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayLogs = await ReminderLog.find({
      reminderId: { $in: reminders.map(r => r._id) },
      scheduledTime: { $gte: startOfToday, $lte: endOfToday }
    }).populate("memberId");

    // Calculate Stats
    const activeRemindersCount = reminders.length;
    const takenTodayCount = todayLogs.filter(l => l.status === "Taken").length;
    const missedTodayCount = todayLogs.filter(l => l.status === "Missed").length;
    const pendingTodayCount = todayLogs.filter(l => l.status === "Sent").length;

    return NextResponse.json({
      reminders,
      todayLogs,
      stats: {
        activeReminders: activeRemindersCount,
        takenToday: takenTodayCount,
        missedToday: missedTodayCount,
        pendingResponses: pendingTodayCount
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching medicine reminders:", error);
    return NextResponse.json({ error: "Failed to fetch reminders" }, { status: 500 });
  }
}

// POST: Create a new medicine reminder
export async function POST(request) {
  try {
    await connectToDatabase();
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      familyId,
      memberId,
      medicineName,
      medicineType,
      dosage,
      foodRelation,
      morning,
      afternoon,
      evening,
      night,
      customTime,
      startDate,
      endDate,
      reminderTime,
      responseWindowMinutes,
      messageTemplate,
      repeatType
    } = body;

    if (!familyId || !memberId || !medicineName || !dosage || !startDate || !endDate || !reminderTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReminder = await MedicineReminder.create({
      familyId,
      memberId,
      medicineName,
      medicineType: medicineType || "Tablet",
      dosage,
      foodRelation: foodRelation || "After Food",
      morning: !!morning,
      afternoon: !!afternoon,
      evening: !!evening,
      night: !!night,
      customTime: customTime || "",
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reminderTime,
      responseWindowMinutes: parseInt(responseWindowMinutes) || 10,
      messageTemplate: messageTemplate || `Hello {name}, this is your reminder to take {dosage} of {medicine}.`,
      repeatType: repeatType || "Daily",
      isActive: true
    });

    // Populate memberId before returning
    const populated = await newReminder.populate("memberId");

    // Pre-seed today's log entry immediately so it populates today's table instantly
    try {
      const now = new Date();
      let timePart = reminderTime;
      let modifier = null;
      if (reminderTime.includes(' ')) {
        const parts = reminderTime.split(' ');
        timePart = parts[0];
        modifier = parts[1];
      }

      let [hoursStr, minutesStr] = timePart.split(':');
      let hours = parseInt(hoursStr) || 0;
      let minutes = parseInt(minutesStr) || 0;

      if (modifier) {
        if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
      }

      const scheduledToday = new Date();
      scheduledToday.setHours(hours, minutes, 0, 0);

      const ReminderLog = (await import("@/models/ReminderLog")).default;
      await ReminderLog.create({
        reminderId: newReminder._id,
        memberId: newReminder.memberId,
        medicineName: newReminder.medicineName,
        dosage: newReminder.dosage,
        scheduledTime: scheduledToday,
        status: 'Sent',
        messageSid: 'pending_trigger'
      });
    } catch (logErr) {
      console.error("Failed to seed initial reminder log:", logErr);
    }

    return NextResponse.json({ message: "Reminder created successfully", reminder: populated }, { status: 201 });
  } catch (error) {
    console.error("Error creating medicine reminder:", error);
    return NextResponse.json({ error: "Failed to create reminder", details: error.message }, { status: 500 });
  }
}
