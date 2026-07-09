// app/api/patient/appointments/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import Appointment from "@/models/Appointment";
import Doctor from "@/models/Doctor";
import FamilyMember from "@/models/FamilyMember";

export async function GET(request) {
    try {
        console.log('===== PATIENT APPOINTMENTS API =====');

        const auth = await getAuthenticatedUser(request);

        if (!auth || !auth.authenticated) {
            return NextResponse.json(
                { error: "Please login to continue" },
                { status: 401 }
            );
        }

        if (auth.role !== 'patient') {
            return NextResponse.json(
                { error: "Access denied. Only patients can view appointments." },
                { status: 403 }
            );
        }

        await connectToDatabase();

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status") || "all";

        // First, find all family members for this user
        const user = await FamilyMember.findOne({ userId: auth.userId }).lean();
        
        // Get all family members in the same family
        let familyMemberIds = [];
        if (user) {
            const familyMembers = await FamilyMember.find({ 
                familyId: user.familyId,
                isActive: true 
            }).select('_id').lean();
            familyMemberIds = familyMembers.map(m => m._id);
        }

        // Also include the user's own ID if they're a family member
        const query = { 
            patientMemberId: { $in: familyMemberIds.length > 0 ? familyMemberIds : [auth.userId] }
        };

        if (status !== "all") {
            query.status = status;
        }

        console.log('Query:', query);

        // Get appointments
        const appointments = await Appointment.find(query)
            .sort({ appointmentDate: -1 })
            .populate('doctorId', 'name specialty hospital avatarColor phone')
            .populate('patientMemberId', 'name relationship avatarColor')
            .lean();

        console.log('Found appointments:', appointments.length);

        // Format appointments
        const formattedAppointments = appointments.map(apt => ({
            id: apt._id,
            doctorName: apt.doctorId?.name || 'Unknown Doctor',
            doctorSpecialty: apt.doctorId?.specialty || 'General',
            doctorInitials: getInitials(apt.doctorId?.name || 'Unknown Doctor'),
            doctorColor: apt.doctorId?.avatarColor || getAvatarColor(apt.doctorId?.name || 'Unknown Doctor'),
            doctorPhone: apt.doctorId?.phone || '',
            patientName: apt.patientName || 'You',
            date: new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            }),
            fullDate: apt.appointmentDate,
            time: apt.timeSlot,
            type: apt.type || 'in-person',
            status: apt.status || 'pending',
            condition: apt.condition || 'General Checkup',
            fee: apt.fee || 0,
            doctorNote: apt.doctorNote || '',
            createdAt: apt.createdAt,
            isVideo: apt.type === 'video',
            isInPerson: apt.type === 'in-person' || !apt.type,
        }));

        // Get counts
        const counts = {
            all: appointments.length,
            pending: appointments.filter(a => a.status === 'pending').length,
            confirmed: appointments.filter(a => a.status === 'confirmed').length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length,
        };

        return NextResponse.json({
            success: true,
            data: {
                appointments: formattedAppointments,
                counts,
            },
        });
    } catch (error) {
        console.error("Patient appointments error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch appointments" },
            { status: 500 }
        );
    }
}

// ── Utility Functions ──────────────────────────────────────

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getAvatarColor(name) {
    if (!name) return 'bg-gray-500';
    const colors = [
        'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 
        'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
        'bg-indigo-500', 'bg-teal-500', 'bg-rose-500',
        'bg-orange-500', 'bg-cyan-500', 'bg-violet-500',
        'bg-lime-500', 'bg-fuchsia-500', 'bg-sky-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}