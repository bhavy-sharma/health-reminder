// app/api/admin/doctors/verify/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import bcrypt from "bcryptjs";

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
    console.log('Verify request body:', body);
    
    const { action, doctorIds, reason, note } = body;

    // Handle both single and bulk actions
    const ids = Array.isArray(doctorIds) ? doctorIds : [doctorIds];

    if (!ids || ids.length === 0) {
      return NextResponse.json(
        { error: "Doctor ID(s) are required" },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    const updatedDoctors = [];

    for (const doctorId of ids) {
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        console.log(`Doctor not found: ${doctorId}`);
        continue;
      }

      let updateData = {
        reviewedBy: authResult.user.userId,
        reviewedAt: new Date(),
        adminNote: note || reason || "",
      };

      switch (action) {
        case 'approve':
          updateData.status = 'approved';
          updateData.isVerified = true;
          
          // Check if user already exists (in case of re-approve)
          const existingUser = await User.findOne({ email: doctor.email });
          if (!existingUser) {
            // Generate a random password for the user
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);
            
            // Create user account for the doctor
            const user = new User({
              fullName: doctor.name,
              email: doctor.email,
              mobile: doctor.phone || '',
              password: hashedPassword,
              role: 'doctor',
              isVerified: true,
              isSuspended: false,
            });
            await user.save();
            console.log(`User created for doctor: ${doctor.email} with temporary password`);
            // Note: In production, you should send this temporary password to the doctor via email
          }
          break;

        case 'reject':
          updateData.status = 'rejected';
          updateData.isVerified = false;
          updateData.rejectionReason = reason || "Application rejected by admin";
          break;

        case 'suspend':
          updateData.status = 'suspended';
          updateData.isVerified = false;
          updateData.suspendedReason = reason || "Suspended by admin";
          updateData.suspendedAt = new Date();
          // Also suspend the user account
          await User.updateOne(
            { email: doctor.email },
            { isSuspended: true, suspendedReason: reason || "Suspended by admin" }
          );
          break;

        case 'unsuspend':
          updateData.status = 'approved';
          updateData.isVerified = true;
          updateData.suspendedReason = null;
          updateData.suspendedAt = null;
          // Also unsuspend the user account
          await User.updateOne(
            { email: doctor.email },
            { isSuspended: false, suspendedReason: null }
          );
          break;

        case 'delete':
          // Delete doctor and user
          await User.deleteOne({ email: doctor.email });
          await Doctor.findByIdAndDelete(doctorId);
          continue; // Skip the update

        default:
          return NextResponse.json(
            { error: `Unknown action: ${action}` },
            { status: 400 }
          );
      }

      const updatedDoctor = await Doctor.findByIdAndUpdate(
        doctorId,
        { $set: updateData },
        { new: true }
      ).select('-password');
      
      if (updatedDoctor) {
        updatedDoctors.push(updatedDoctor);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${action} action completed successfully`,
      data: updatedDoctors,
    });
  } catch (error) {
    console.error("Error verifying doctor:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to verify doctor" 
      },
      { status: 500 }
    );
  }
}