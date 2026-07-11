import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
import { getForgotPasswordEmailTemplate } from "@/lib/emailTemplates";

export async function POST(request) {
  try {
    await connectToDatabase();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: "User with this email does not exist" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = {
      code: otpCode,
      expiresAt: otpExpires,
    };

    await user.save();

    // Print OTP to terminal as a backup
    console.log(`\n==========================================`);
    console.log(`[PASSWORD RESET OTP FOR ${email.toUpperCase()}]: ${otpCode}`);
    console.log(`Expires at: ${otpExpires}`);
    console.log(`==========================================\n`);

    // Send the email using centralized utility
    const htmlContent = getForgotPasswordEmailTemplate({
      name: user.fullName,
      otpCode
    });

    const emailSent = await sendEmail({
      to: email.toLowerCase(),
      subject: "Reset your Password - Family Health",
      html: htmlContent
    });

    if (!emailSent) {
      return NextResponse.json(
        { 
          message: "OTP generated successfully, but real email delivery failed. (Check server terminal for OTP)",
          warning: "Mail configuration error"
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "OTP verification code sent successfully to your email address." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
