// app/api/admin/doctors/verify/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { validateUserRole } from "@/lib/auth";
import Doctor from "@/models/Doctor";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";
import { getDoctorApprovalEmailTemplate, getDoctorRejectionEmailTemplate } from "@/lib/emailTemplates";

export async function POST(request) {
  try {
    console.log("=== START: Doctor verification request ===");
    
    // 1. Validate user role
    let authResult;
    try {
      authResult = await validateUserRole(request, ['admin', 'staff']);
      console.log("Auth result:", { 
        valid: authResult.valid, 
        user: authResult.user ? {
          userId: authResult.user.userId,
          email: authResult.user.email,
          role: authResult.user.role
        } : null,
        error: authResult.error
      });
    } catch (authError) {
      console.error("Authentication error:", authError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication failed: " + authError.message 
        },
        { status: 500 }
      );
    }
    
    // Check authentication
    if (!authResult || !authResult.valid) {
      console.log("Auth invalid:", authResult);
      const status = authResult?.status || 401;
      const message = authResult?.error || 'Authentication failed';
      return NextResponse.json(
        { success: false, error: message },
        { status }
      );
    }

    // 2. Connect to database
    try {
      await connectToDatabase();
      console.log("Database connected successfully");
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Database connection failed: " + dbError.message 
        },
        { status: 500 }
      );
    }

    // 3. Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Verify request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }
    
    const { action, doctorIds, reason, note } = body;

    // 4. Validate required fields
    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    // 5. Handle IDs
    let ids = [];
    if (Array.isArray(doctorIds)) {
      ids = doctorIds;
    } else if (doctorIds) {
      ids = [doctorIds];
    }

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Doctor ID(s) are required" },
        { status: 400 }
      );
    }

    console.log(`Processing ${action} for ${ids.length} doctor(s)`);

    const updatedDoctors = [];
    const errors = [];

    // 6. Process each doctor
    for (const doctorId of ids) {
      try {
        console.log(`\n--- Processing doctor: ${doctorId} ---`);
        
        // Find doctor
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
          console.log(`Doctor not found: ${doctorId}`);
          errors.push(`Doctor ${doctorId} not found`);
          continue;
        }

        console.log(`Found doctor: ${doctor.name} (${doctor.email}) - Status: ${doctor.status}`);

        // Build update data
        const updateData = {
          reviewedBy: authResult.user?.userId || authResult.user?.id,
          reviewedAt: new Date(),
          adminNote: note || reason || "",
        };

        let actionSuccess = false;

        // 7. Handle different actions
        switch (action) {
          case 'approve': {
            console.log("Approving doctor...");
            updateData.status = 'approved';
            updateData.isVerified = true;
            
            // Check if user already exists
            let existingUser = await User.findOne({ email: doctor.email }).lean();
            
            if (!existingUser) {
              console.log("Creating user account for doctor...");
              // Generate temporary password
              const tempPassword = Math.random().toString(36).slice(-10);
              const hashedPassword = await bcrypt.hash(tempPassword, 10);
              
              // Create user
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
              console.log(`✅ User created for doctor: ${doctor.email}`);
              
              // Send email with temporary password (non-blocking)
              try {
                // You might want to send the temp password here
                // sendEmail({...})
              } catch (emailError) {
                console.error("Email sending failed but continuing:", emailError.message);
              }
            } else {
              console.log(`User already exists for ${doctor.email}`);
            }
            
            actionSuccess = true;
            break;
          }

          case 'reject': {
            console.log("Rejecting doctor...");
            updateData.status = 'rejected';
            updateData.isVerified = false;
            updateData.rejectionReason = reason || "Application rejected by admin";
            actionSuccess = true;
            break;
          }

          case 'suspend': {
            console.log("Suspending doctor...");
            updateData.status = 'suspended';
            updateData.isVerified = false;
            updateData.suspendedReason = reason || "Suspended by admin";
            updateData.suspendedAt = new Date();
            
            // Also suspend the user account
            await User.updateOne(
              { email: doctor.email },
              { 
                isSuspended: true, 
                suspendedReason: reason || "Suspended by admin" 
              }
            );
            actionSuccess = true;
            break;
          }

          case 'unsuspend': {
            console.log("Unsuspending doctor...");
            updateData.status = 'approved';
            updateData.isVerified = true;
            updateData.suspendedReason = null;
            updateData.suspendedAt = null;
            
            // Also unsuspend the user account
            await User.updateOne(
              { email: doctor.email },
              { isSuspended: false, suspendedReason: null }
            );
            actionSuccess = true;
            break;
          }

          case 'delete': {
            console.log("Deleting doctor...");
            // Delete user and doctor
            await User.deleteOne({ email: doctor.email });
            await Doctor.findByIdAndDelete(doctorId);
            console.log(`✅ Deleted doctor: ${doctor.email}`);
            actionSuccess = true;
            continue; // Skip the update
          }

          default: {
            const errorMsg = `Unknown action: ${action}`;
            console.log(errorMsg);
            errors.push(errorMsg);
            continue;
          }
        }

        // 8. Update doctor if not deleted
        if (actionSuccess && action !== 'delete') {
          const updatedDoctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { $set: updateData },
            { new: true, runValidators: true }
          ).select('-password');
          
          if (updatedDoctor) {
            updatedDoctors.push(updatedDoctor);
            console.log(`✅ Doctor updated: ${updatedDoctor.name} -> ${updatedDoctor.status}`);
          } else {
            errors.push(`Failed to update doctor ${doctorId}`);
          }

          // 9. Send email notification (non-blocking)
          try {
            const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`;
            
            if (action === 'approve') {
              const htmlContent = getDoctorApprovalEmailTemplate({
                name: updatedDoctor.name,
                loginUrl
              });
              await sendEmail({
                to: updatedDoctor.email,
                subject: "Your Family Health Doctor Profile Has Been Approved",
                html: htmlContent
              });
              console.log(`✅ Approval email sent to ${updatedDoctor.email}`);
            } else if (action === 'reject') {
              const htmlContent = getDoctorRejectionEmailTemplate({
                name: updatedDoctor.name,
                reason: reason || note || "Not specified",
                profileUrl: loginUrl
              });
              await sendEmail({
                to: updatedDoctor.email,
                subject: "Your Family Health Doctor Profile Requires Attention",
                html: htmlContent
              });
              console.log(`✅ Rejection email sent to ${updatedDoctor.email}`);
            }
          } catch (emailError) {
            // Non-blocking - log but don't fail
            console.error("⚠️ Email sending failed:", emailError.message);
          }
        }

      } catch (error) {
        console.error(`Error processing doctor ${doctorId}:`, error);
        errors.push(`Error processing ${doctorId}: ${error.message}`);
      }
    }

    // 10. Return response
    if (updatedDoctors.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `No doctors were updated. Errors: ${errors.join(', ')}` 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${action} action completed for ${updatedDoctors.length} doctor(s)`,
      data: updatedDoctors,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error("Unhandled error in verify route:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to verify doctor" 
      },
      { status: 500 }
    );
  }
}