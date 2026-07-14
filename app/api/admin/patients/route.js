// app/api/admin/patients/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import User from "@/models/User";
import Family from "@/models/Family";
import FamilyMember from "@/models/FamilyMember";
import { sendEmail } from "@/lib/email";
import { 
  getPatientVerificationEmailTemplate, 
  getPatientSuspensionEmailTemplate, 
  getPatientUnsuspensionEmailTemplate,
  getPatientDeletionEmailTemplate 
} from "@/lib/emailTemplates";

export async function GET(request) {
  try {
    console.log('===== PATIENTS API CALLED =====');
    
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { 
          error: authResult.error || 'Authentication failed',
          message: authResult.reason || authResult.error,
          status: authResult.status 
        },
        { status: authResult.status || 401 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "All Plans";
    const status = searchParams.get("status") || "All Status";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    console.log('Query params:', { search, plan, status, page, limit });

    // Build query for Users with role 'patient'
    const query = { role: 'patient' };
    
    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { mobile: searchRegex },
      ];
    }

    // Status filter
    if (status !== "All Status") {
      if (status === 'active') {
        query.isSuspended = false;
        query.isVerified = true;
      } else if (status === 'suspended') {
        query.isSuspended = true;
      } else if (status === 'inactive') {
        query.isVerified = false;
        query.isSuspended = false;
      }
    }

    // Get total count
    const total = await User.countDocuments(query);
    console.log(`Total patients found: ${total}`);

    // Get users with pagination
    const users = await User.find(query)
      .select('fullName email mobile city role isVerified isSuspended suspendedReason suspendedAt suspendedBy families createdAt updatedAt profile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`Returning ${users.length} users for page ${page}`);

    // Process each user
    const patientsWithDetails = await Promise.all(
      users.map(async (user) => {
        let family = null;
        let familyMembers = [];
        let plan = 'Free';
        let familyStatus = 'active';
        
        // Get user's primary family
        if (user.families && user.families.length > 0) {
          const activeFamily = user.families.find(f => f.isActive) || user.families[0];
          
          if (activeFamily) {
            family = await Family.findById(activeFamily.familyId).lean();
            
            if (family) {
              plan = family.plan?.type || 'Free';
              familyStatus = family.isActive ? 'active' : 'inactive';
              
              familyMembers = await FamilyMember.find({ 
                familyId: family._id,
                isActive: true 
              })
              .select('name email city phone relationship avatarColor isPrimary')
              .lean();
            }
          }
        }

        // Determine status
        let userStatus = 'active';
        let statusLabel = 'Active';
        let statusColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
        
        if (user.isSuspended) {
          userStatus = 'suspended';
          statusLabel = 'Suspended';
          statusColor = 'bg-red-50 text-red-500 border-red-100';
        } else if (!user.isVerified) {
          userStatus = 'inactive';
          statusLabel = 'Inactive';
          statusColor = 'bg-gray-100 text-gray-500 border-gray-200';
        }

        const primaryMember = familyMembers.find(m => m.isPrimary) || familyMembers[0];
        
        return {
          id: user._id,
          name: user.fullName || 'Unknown',
          email: user.email || '',
          mobile: user.mobile || '',
          city: user.city || primaryMember?.city || 'Unknown',
          plan: plan,
          members: familyMembers.length || 0,
          status: userStatus,
          statusLabel: statusLabel,
          statusColor: statusColor,
          familyId: family?._id || null,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          initials: getInitials(user.fullName),
          color: getAvatarColor(user.fullName),
          isVerified: user.isVerified,
          isSuspended: user.isSuspended,
          suspendedReason: user.suspendedReason,
          suspendedAt: user.suspendedAt,
          suspendedBy: user.suspendedBy,
          membersList: familyMembers,
          family: family,
          user: {
            fullName: user.fullName,
            email: user.email,
            mobile: user.mobile,
            role: user.role,
            profile: user.profile,
          }
        };
      })
    );

    // Apply plan filter
    let filteredPatients = patientsWithDetails;
    if (plan !== "All Plans") {
      filteredPatients = filteredPatients.filter(p => p.plan === plan);
    }

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        patients: filteredPatients,
        total: filteredPatients.length,
        page,
        limit,
        totalPages,
        filters: {
          search,
          plan,
          status,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch patients" 
      },
      { status: 500 }
    );
  }
}

// ── POST: Update patient status ──────────────────────────────

export async function POST(request) {
  try {
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status || 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const { action, patientIds, reason } = body;

    if (!action || !patientIds || patientIds.length === 0) {
      return NextResponse.json(
        { error: "Action and patientIds are required" },
        { status: 400 }
      );
    }

    if (action === 'delete' && !reason) {
      return NextResponse.json(
        { error: "Reason is required for deletion" },
        { status: 400 }
      );
    }

    // Fetch target users to get their emails and names before they are potentially deleted
    const targetUsers = await User.find({ _id: { $in: patientIds } })
      .select('email fullName')
      .lean();

    let result;

    switch (action) {
      case 'suspend':
        result = await User.updateMany(
          { _id: { $in: patientIds } },
          { 
            isSuspended: true,
            suspendedReason: reason || 'Suspended by admin',
            suspendedAt: new Date(),
            suspendedBy: authResult.user.userId
          }
        );
        break;

      case 'unsuspend':
        result = await User.updateMany(
          { _id: { $in: patientIds } },
          { 
            isSuspended: false,
            suspendedReason: null,
            suspendedAt: null,
            suspendedBy: null
          }
        );
        break;

      case 'verify':
        result = await User.updateMany(
          { _id: { $in: patientIds } },
          { 
            isVerified: true,
          }
        );
        break;

      case 'delete':
        result = await User.deleteMany(
          { _id: { $in: patientIds } }
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // Send emails
    if (['suspend', 'unsuspend', 'delete', 'verify'].includes(action)) {
      // Fire off emails asynchronously without blocking the response
      Promise.all(targetUsers.map(async (user) => {
        if (!user.email) return;
        
        try {
          let html = '';
          let subject = '';
          
          if (action === 'verify') {
            subject = 'Your Account has been Verified - Family Health';
            html = getPatientVerificationEmailTemplate({ name: user.fullName || 'Patient' });
          } else if (action === 'suspend') {
            subject = 'Account Suspended - Family Health';
            html = getPatientSuspensionEmailTemplate({ name: user.fullName || 'Patient', reason: reason || 'Suspended by admin' });
          } else if (action === 'unsuspend') {
            subject = 'Account Restored - Family Health';
            html = getPatientUnsuspensionEmailTemplate({ name: user.fullName || 'Patient' });
          } else if (action === 'delete') {
            subject = 'Account Deleted - Family Health';
            html = getPatientDeletionEmailTemplate({ name: user.fullName || 'Patient', reason });
          }
          
          if (html) {
            await sendEmail({ to: user.email, subject, html });
          }
        } catch (emailError) {
          console.error(`Failed to send ${action} email to ${user.email}:`, emailError);
        }
      })).catch(err => {
        console.error("Error in email sending batch:", err);
      });
    }

    return NextResponse.json({
      success: true,
      message: `${action} action completed successfully`,
      data: result,
    });
  } catch (error) {
    console.error("Error updating patients:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to update patients" 
      },
      { status: 500 }
    );
  }
}

// ── GET: Single patient details ──────────────────────────────

export async function GET_PATIENT(request, { params }) {
  try {
    const authResult = await validateUserRole(request, ['admin', 'staff']);
    
    if (!authResult.valid) {
      return NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: authResult.status || 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    
    const user = await User.findById(id)
      .select('-password -otp -resetToken')
      .lean();
      
    if (!user) {
      return NextResponse.json(
        { error: "Patient not found" },
        { status: 404 }
      );
    }

    // Get family info
    let family = null;
    let familyMembers = [];
    let plan = 'Free';
    
    if (user.families && user.families.length > 0) {
      const activeFamily = user.families.find(f => f.isActive) || user.families[0];
      if (activeFamily) {
        family = await Family.findById(activeFamily.familyId).lean();
        if (family) {
          plan = family.plan?.type || 'Free';
          familyMembers = await FamilyMember.find({ 
            familyId: family._id,
            isActive: true 
          }).lean();
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        family,
        familyMembers,
        plan,
      },
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to fetch patient" 
      },
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