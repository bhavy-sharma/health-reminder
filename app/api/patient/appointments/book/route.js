// app/api/patient/appointments/book/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import FamilyMember from "@/models/FamilyMember";
import User from "@/models/User";

// Helper function to clean phone number
function cleanPhoneNumber(phone) {
    if (!phone) return '';
    
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = cleaned.substring(2);
    }
    
    if (cleaned.startsWith('0') && cleaned.length === 11) {
        cleaned = cleaned.substring(1);
    }
    
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
    // Parse the date
    let appointmentDate;
    if (typeof date === 'string') {
        appointmentDate = new Date(date);
    } else if (date instanceof Date) {
        appointmentDate = new Date(date);
    } else {
        appointmentDate = new Date();
    }
    
    // If date is invalid, use tomorrow
    if (isNaN(appointmentDate.getTime())) {
        appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() + 1);
    }
    
    // Parse time slot
    const { hours, minutes } = parseTimeSlot(timeSlot);
    
    // Set the time
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    return appointmentDate;
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

        // Create full appointment datetime
        const appointmentDateTime = getAppointmentDateTime(appointmentDate, timeSlot);
        console.log('Appointment datetime:', appointmentDateTime);
        console.log('Current time:', new Date());

        // Check if the appointment is in the past
        const now = new Date();
        if (appointmentDateTime < now) {
            return NextResponse.json(
                { 
                    error: "This time slot has already passed. Please select a future time.",
                    code: "PAST_SLOT"
                },
                { status: 400 }
            );
        }

        // Check if slot is available
        const existing = await Appointment.findOne({
            doctorId,
            appointmentDate: appointmentDateTime,
            timeSlot,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existing) {
            return NextResponse.json(
                { error: "This time slot is already booked" },
                { status: 409 }
            );
        }

        // Calculate age from date of birth
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

        // Get phone number
        let patientPhone = patientMember.phone || '';

        if (!patientPhone && patientMember.userId) {
            const user = await User.findById(patientMember.userId);
            if (user) {
                patientPhone = user.mobile || '';
            }
        }

        if (!patientPhone && patientMember.emergencyContact?.phone) {
            patientPhone = patientMember.emergencyContact.phone;
        }

        if (!patientPhone) {
            return NextResponse.json(
                {
                    error: "Patient phone number is required. Please add a phone number to this family member.",
                    code: "MISSING_PHONE"
                },
                { status: 400 }
            );
        }

        const cleanedPhone = cleanPhoneNumber(patientPhone);

        if (!cleanedPhone || cleanedPhone.length !== 10) {
            return NextResponse.json(
                {
                    error: "Invalid phone number. Please enter a valid 10-digit phone number.",
                    code: "INVALID_PHONE"
                },
                { status: 400 }
            );
        }

        // Create appointment
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