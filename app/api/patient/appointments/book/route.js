// app/api/patient/appointments/book/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";
import { checkPlanLimit } from "@/lib/plan-utils";

// ─── WhatsApp Integration ──────────────────────────────────
const twilioSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

async function sendWhatsAppMessage(to, body) {
  console.log(`[TWILIO] To: ${to} | Body: ${body.substring(0, 60)}...`);
  
  if (!twilioSid || !twilioAuthToken) {
    console.log('[TWILIO] Mock mode - no credentials found');
    return { sid: 'mock_' + Math.random().toString(36).substr(2, 9) };
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: twilioFrom,
        To: `whatsapp:${to}`,
        Body: body
      })
    });
    const data = await response.json();
    console.log('[TWILIO] Response:', data);
    return data;
  } catch (error) {
    console.error('[TWILIO ERROR]', error);
    return { sid: 'error_' + Math.random().toString(36).substr(2, 9) };
  }
}

// Helper function to clean phone number
function cleanPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.substring(2);
    if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.substring(1);
    return cleaned;
}

// Helper function to parse time slot
function parseTimeSlot(timeSlot) {
    if (!timeSlot) return { hours: 9, minutes: 0 };
    const parts = timeSlot.trim().split(' ');
    if (parts.length !== 2) return { hours: 9, minutes: 0 };
    const [timeStr, modifier] = parts;
    const timeParts = timeStr.split(':');
    if (timeParts.length !== 2) return { hours: 9, minutes: 0 };
    let hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
}

// Helper function to create full appointment datetime
function getAppointmentDateTime(date, timeSlot) {
    let appointmentDate;
    if (typeof date === 'string') {
        appointmentDate = new Date(date);
    } else if (date instanceof Date) {
        appointmentDate = new Date(date);
    } else {
        appointmentDate = new Date();
    }
    if (isNaN(appointmentDate.getTime())) {
        appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 1);
    }
    const { hours, minutes } = parseTimeSlot(timeSlot);
    appointmentDate.setHours(hours, minutes, 0, 0);
    return appointmentDate;
}

// Helper: Get all booked slots for a doctor on a specific date
async function getBookedSlots(doctorId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
        doctorId,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'confirmed'] },
    });
    return appointments.map(apt => apt.timeSlot);
}

// Helper: Find next available slot
async function findNextAvailableSlot(doctorId, date, doctorSlots) {
    const bookedSlots = await getBookedSlots(doctorId, date);
    
    for (const slot of doctorSlots) {
        if (!bookedSlots.includes(slot)) {
            return { timeSlot: slot, date: date, label: 'Today' };
        }
    }
    
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowBooked = await getBookedSlots(doctorId, tomorrow);
    for (const slot of doctorSlots) {
        if (!tomorrowBooked.includes(slot)) {
            return { timeSlot: slot, date: tomorrow, label: 'Tomorrow' };
        }
    }
    
    const dayAfter = new Date(date);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterBooked = await getBookedSlots(doctorId, dayAfter);
    for (const slot of doctorSlots) {
        if (!dayAfterBooked.includes(slot)) {
            return { timeSlot: slot, date: dayAfter, label: 'In 2 days' };
        }
    }
    
    return null;
}

export async function POST(request) {
    try {
        console.log('===== BOOK APPOINTMENT API =====');

        const auth = await getAuthenticatedUser(request);

        if (!auth || !auth.authenticated) {
            return NextResponse.json(
                { error: "Please login to continue" },
                { status: 401 }
            );
        }

        if (auth.role !== 'patient') {
            return NextResponse.json(
                { error: "Access denied. Only patients can book appointments." },
                { status: 403 }
            );
        }

        await connectToDatabase();

        const body = await request.json();
        const {
            doctorId,
            patientMemberId,
            condition,
            appointmentDate,
            timeSlot,
            type,
            fee
        } = body;

        console.log('Booking request:', { doctorId, patientMemberId, appointmentDate, timeSlot, type, fee });

        // Validate required fields
        if (!doctorId) {
            return NextResponse.json(
                { error: "Doctor ID is required" },
                { status: 400 }
            );
        }

        if (!patientMemberId) {
            return NextResponse.json(
                { error: "Patient member ID is required" },
                { status: 400 }
            );
        }

        if (!timeSlot) {
            return NextResponse.json(
                { error: "Time slot is required" },
                { status: 400 }
            );
        }

        // Get patient details from FamilyMember
        const patientMember = await FamilyMember.findById(patientMemberId)
            .populate('familyId')
            .lean();

        if (!patientMember) {
            return NextResponse.json(
                { error: "Patient member not found" },
                { status: 404 }
            );
        }

        // Check if doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return NextResponse.json(
                { error: "Doctor not found" },
                { status: 404 }
            );
        }

        // ─── CHECK PLAN LIMITS ───
        const planCheck = await checkPlanLimit(doctorId);
        
        if (!planCheck.allowed) {
            const upgradeMessage = planCheck.plan === 'free' 
                ? `You've reached the ${planCheck.limit} booking limit for the Free plan. Upgrade to Pro or Premium for unlimited bookings.`
                : `You've reached your booking limit of ${planCheck.limit} for the ${planCheck.plan} plan. Please contact support.`;
            
            return NextResponse.json({
                success: false,
                error: "Booking limit reached",
                code: "PLAN_LIMIT_REACHED",
                message: upgradeMessage,
                planCheck: {
                    used: planCheck.used,
                    limit: planCheck.limit,
                    remaining: planCheck.remaining,
                    plan: planCheck.plan,
                    isUnlimited: planCheck.isUnlimited
                }
            }, { status: 403 });
        }

        // ─── Check if doctor has this time slot in their schedule ───
        const doctorSlots = doctor.appointmentSlots || [];
        const isInSchedule = doctorSlots.includes(timeSlot);
        
        if (!isInSchedule && doctorSlots.length > 0) {
            const nextSlot = await findNextAvailableSlot(
                doctorId, 
                appointmentDate || new Date(), 
                doctorSlots
            );
            
            if (nextSlot) {
                return NextResponse.json({
                    success: false,
                    error: "Time slot not in doctor's schedule",
                    code: "SLOT_NOT_IN_SCHEDULE",
                    suggested: {
                        timeSlot: nextSlot.timeSlot,
                        date: nextSlot.date.toISOString().split('T')[0],
                        label: nextSlot.label,
                        fullDateTime: nextSlot.date.toISOString(),
                    },
                    message: `Dr. ${doctor.name} is not available at ${timeSlot}. Next available: ${nextSlot.timeSlot} (${nextSlot.label})`,
                }, { status: 409 });
            } else {
                return NextResponse.json({
                    success: false,
                    error: "No available slots",
                    code: "NO_SLOTS",
                    message: `Dr. ${doctor.name} has no available slots in the next 3 days. Please try a different date.`,
                }, { status: 400 });
            }
        }

        // ─── Check if slot is already booked ───
        const appointmentDateTime = getAppointmentDateTime(appointmentDate || new Date(), timeSlot);
        
        const existing = await Appointment.findOne({
            doctorId,
            appointmentDate: appointmentDateTime,
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existing) {
            const nextSlot = await findNextAvailableSlot(
                doctorId, 
                appointmentDate || new Date(), 
                doctorSlots
            );
            
            if (nextSlot) {
                return NextResponse.json({
                    success: false,
                    error: "Time slot already booked",
                    code: "SLOT_BOOKED",
                    suggested: {
                        timeSlot: nextSlot.timeSlot,
                        date: nextSlot.date.toISOString().split('T')[0],
                        label: nextSlot.label,
                        fullDateTime: nextSlot.date.toISOString(),
                    },
                    message: `The ${timeSlot} slot is already booked. Next available: ${nextSlot.timeSlot} (${nextSlot.label})`,
                }, { status: 409 });
            } else {
                return NextResponse.json({
                    success: false,
                    error: "All slots booked",
                    code: "ALL_BOOKED",
                    message: `All slots are booked for this date. Please try a different date.`,
                }, { status: 400 });
            }
        }

        // ─── Check if appointment is in the past ───
        const now = new Date();
        if (appointmentDateTime < now) {
            return NextResponse.json({
                error: "This time slot has already passed. Please select a future time.",
                code: "PAST_SLOT"
            }, { status: 400 });
        }

        // ─── Calculate age ───
        let age = 0;
        if (patientMember.dateOfBirth) {
            const birthDate = new Date(patientMember.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        // ─── Get phone number ───
        let patientPhone = patientMember.phone || '';
        if (!patientPhone && patientMember.userId) {
            const user = await User.findById(patientMember.userId);
            if (user) patientPhone = user.mobile || '';
        }
        if (!patientPhone && patientMember.emergencyContact?.phone) {
            patientPhone = patientMember.emergencyContact.phone;
        }
        if (!patientPhone) {
            return NextResponse.json({
                error: "Patient phone number is required. Please add a phone number to this family member.",
                code: "MISSING_PHONE"
            }, { status: 400 });
        }

        const cleanedPhone = cleanPhoneNumber(patientPhone);
        if (!cleanedPhone || cleanedPhone.length !== 10) {
            return NextResponse.json({
                error: "Invalid phone number. Please enter a valid 10-digit phone number.",
                code: "INVALID_PHONE"
            }, { status: 400 });
        }

        // ─── Create appointment ───
        const appointmentData = {
            doctorId,
            patientFamilyId: patientMember.familyId._id,
            patientMemberId: patientMember._id,
            patientName: patientMember.name,
            patientPhone: cleanedPhone,
            patientAge: age || 0,
            condition: condition || 'General Checkup',
            appointmentDate: appointmentDateTime,
            timeSlot,
            type: type || 'in-person',
            status: 'pending',
            fee: fee || doctor.consultationFee || 0,
        };

        console.log('Creating appointment with data:', {
            ...appointmentData,
            patientPhone: '[HIDDEN]'
        });

        const appointment = new Appointment(appointmentData);
        await appointment.save();

        // ─── SEND WHATSAPP APPOINTMENT REMINDER (Only for Pro/Premium doctors) ───
        const doctorPlan = doctor.plan?.type || 'free';
        const isProOrPremium = doctorPlan === 'pro' || doctorPlan === 'premium';

        if (isProOrPremium && cleanedPhone) {
            try {
                const formattedDate = new Date(appointmentDateTime).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                const formattedTime = timeSlot;

                const doctorPhone = doctor.phone || '';
                const doctorName = doctor.name || 'Doctor';

                // ── WhatsApp message to PATIENT ──
                const patientMessage = `🏥 *Appointment Confirmation*\n\n` +
                    `Dear ${patientMember.name},\n\n` +
                    `Your appointment with *Dr. ${doctorName}* has been booked successfully.\n\n` +
                    `📅 Date: ${formattedDate}\n` +
                    `🕐 Time: ${formattedTime}\n` +
                    `📍 Type: ${type === 'video' ? '🎥 Video Consultation' : '🏢 In-Person Visit'}\n` +
                    `💊 Reason: ${condition || 'General Checkup'}\n\n` +
                    `Please arrive 10 minutes early.\n\n` +
                    `Thank you for choosing Family Health! ❤️`;

                await sendWhatsAppMessage(`91${cleanedPhone}`, patientMessage);
                console.log(`✅ WhatsApp notification sent to patient: ${cleanedPhone}`);

                // ── WhatsApp message to DOCTOR (only if doctor has phone) ──
                if (doctorPhone) {
                    const cleanedDoctorPhone = cleanPhoneNumber(doctorPhone);
                    if (cleanedDoctorPhone && cleanedDoctorPhone.length === 10) {
                        const doctorMessage = `📋 *New Appointment Booked*\n\n` +
                            `Dr. ${doctorName},\n\n` +
                            `A new appointment has been booked with you.\n\n` +
                            `👤 Patient: ${patientMember.name}\n` +
                            `📅 Date: ${formattedDate}\n` +
                            `🕐 Time: ${formattedTime}\n` +
                            `📍 Type: ${type === 'video' ? '🎥 Video' : '🏢 In-Person'}\n` +
                            `💊 Reason: ${condition || 'General Checkup'}\n` +
                            `📞 Phone: +91${cleanedPhone}\n\n` +
                            `Please confirm the appointment at your earliest convenience.`;

                        await sendWhatsAppMessage(`91${cleanedDoctorPhone}`, doctorMessage);
                        console.log(`✅ WhatsApp notification sent to doctor: ${cleanedDoctorPhone}`);
                    }
                }

                // ── Send reminder to patient if video appointment ──
                if (type === 'video') {
                    const videoMessage = `🎥 *Video Consultation Reminder*\n\n` +
                        `Hi ${patientMember.name},\n\n` +
                        `Your video consultation with Dr. ${doctorName} is scheduled for ${formattedDate} at ${formattedTime}.\n\n` +
                        `Please ensure you have a stable internet connection and join the call on time.\n\n` +
                        `A link will be shared closer to the appointment time.`;

                    await sendWhatsAppMessage(`91${cleanedPhone}`, videoMessage);
                }

            } catch (whatsappError) {
                console.error('❌ WhatsApp notification failed:', whatsappError);
                // Don't fail the booking if WhatsApp fails
            }
        } else {
            console.log(`ℹ️ WhatsApp notifications skipped - Doctor plan: ${doctorPlan}`);
        }

        return NextResponse.json({
            success: true,
            message: "Appointment booked successfully",
            data: {
                id: appointment._id,
                patientName: appointment.patientName,
                doctorName: doctor.name,
                appointmentDate: appointment.appointmentDate,
                timeSlot: appointment.timeSlot,
                status: appointment.status,
                whatsappSent: isProOrPremium,
            },
        });

    } catch (error) {
        console.error("Book appointment error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to book appointment" },
            { status: 500 }
        );
    }
}