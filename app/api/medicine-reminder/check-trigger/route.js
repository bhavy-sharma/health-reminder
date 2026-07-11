import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MedicineReminder from "@/models/MedicineReminder";
import ReminderLog from "@/models/ReminderLog";
import { parseTimeToNumbers, formatTo12Hour } from "@/lib/timeUtils";

// In-memory notification store (polled by frontend every 4.5s)
if (!global.simulatedNotifications) {
  global.simulatedNotifications = [];
}

const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

const sendWhatsAppSMS = async (to, body) => {
  console.log(`[TWILIO] To: ${to} | Body: ${body.substring(0, 60)}...`);
  if (twilioSid && twilioAuthToken) {
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ From: twilioFrom, To: `whatsapp:${to}`, Body: body })
      });
      return await response.json();
    } catch (e) {
      console.error("[TWILIO ERROR]", e);
    }
  }
  return { sid: 'mock_' + Math.random().toString(36).substr(2, 9) };
};

// GET: Retrieve live notification feed
export async function GET() {
  return NextResponse.json({ notifications: global.simulatedNotifications || [] }, { status: 200 });
}

// POST: Run reminder checks OR handle "Send Again" resend extension
export async function POST(request) {
  try {
    await connectToDatabase();

    let body = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { familyId, extendLogId } = body;

    // ── "Send Reminder Again" – extend 10min window ──────────────────────────
    if (extendLogId) {
      const log = await ReminderLog.findById(extendLogId);
      if (log) {
        log.status = 'Sent';
        log.scheduledTime = new Date();
        log.messageSid = 'pending_trigger';
        await log.save();

        global.simulatedNotifications.unshift({
          id: Math.random().toString(36).substr(2, 9),
          type: 'Reminder Resent',
          message: `Resent reminder — window extended 10 min for ${log.medicineName}`,
          timestamp: new Date()
        });
      }
      return NextResponse.json({ success: true, extended: true }, { status: 200 });
    }

    // ── Standard cron check ───────────────────────────────────────────────────
    if (!familyId) {
      return NextResponse.json({ error: "familyId is required" }, { status: 400 });
    }

    const reminders = await MedicineReminder.find({ familyId, isActive: true }).populate("memberId");
    const now = new Date();
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday   = new Date(now); endOfToday.setHours(23, 59, 59, 999);
    const todayLogs = [];

    for (const reminder of reminders) {
      const memberName = reminder.memberId?.name || "Member";
      const phone = reminder.memberId?.emergencyContact?.phone || "+919999999999";

      // Skip if today is outside the reminder's active date window
      const todayDate  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startDate  = new Date(reminder.startDate.getFullYear(), reminder.startDate.getMonth(), reminder.startDate.getDate());
      const endDate    = new Date(reminder.endDate.getFullYear(), reminder.endDate.getMonth(), reminder.endDate.getDate());
      if (todayDate < startDate || todayDate > endDate) continue;

      // Parse time using utility function
      const { hours, minutes } = parseTimeToNumbers(reminder.reminderTime);
      
      const scheduledTime = new Date(now);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // Find or create today's log for this reminder
      let log = await ReminderLog.findOne({
        reminderId: reminder._id,
        scheduledTime: { $gte: startOfToday, $lte: endOfToday }
      });

      if (!log) {
        log = await ReminderLog.create({
          reminderId: reminder._id,
          memberId: reminder.memberId._id,
          medicineName: reminder.medicineName,
          dosage: reminder.dosage,
          scheduledTime,
          status: 'Sent',
          messageSid: 'pending_trigger'
        });

        const formattedTime = formatTo12Hour(reminder.reminderTime);
        global.simulatedNotifications.unshift({
          id: Math.random().toString(36).substr(2, 9),
          type: 'Reminder Sent',
          message: `Reminder created for ${memberName} — ${reminder.medicineName} @ ${formattedTime}`,
          timestamp: new Date()
        });

        // If already past scheduled time, fire WhatsApp now
        if (now >= scheduledTime) {
          const msg = `Hello ${memberName},\n\nTime to take your medicine.\n\nMedicine: ${reminder.medicineName}\nDosage: ${reminder.dosage}\n\nReply:\n1️⃣ TAKEN\n2️⃣ SKIP`;
          const res = await sendWhatsAppSMS(phone, msg);
          log.messageSid = res?.sid || 'mock_sid';
          await log.save();
        }
      } else if (log.status === 'Sent') {
        // Fire WhatsApp if scheduled time reached and not yet sent
        if (now >= scheduledTime && log.messageSid === 'pending_trigger') {
          const msg = `Hello ${memberName},\n\nTime to take your medicine.\n\nMedicine: ${reminder.medicineName}\nDosage: ${reminder.dosage}\n\nReply:\n1️⃣ TAKEN\n2️⃣ SKIP`;
          const res = await sendWhatsAppSMS(phone, msg);
          log.messageSid = res?.sid || 'mock_sid';
          await log.save();
        }

        // Auto-mark Missed if response window expired
        const windowEnd = new Date(log.scheduledTime.getTime() + reminder.responseWindowMinutes * 60000);
        if (now > windowEnd) {
          log.status = 'Missed';
          await log.save();

          global.simulatedNotifications.unshift({
            id: Math.random().toString(36).substr(2, 9),
            type: 'Medicine Missed',
            message: `⚠️ ${memberName} missed ${reminder.medicineName} — no reply within ${reminder.responseWindowMinutes} min`,
            timestamp: new Date()
          });
        }
      }

      todayLogs.push(log);
    }

    return NextResponse.json({ success: true, logs: todayLogs }, { status: 200 });

  } catch (error) {
    console.error("check-trigger error:", error);
    return NextResponse.json({ error: "Trigger failed", details: error.message }, { status: 500 });
  }
}