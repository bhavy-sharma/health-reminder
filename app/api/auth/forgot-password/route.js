import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import nodemailer from "nodemailer";

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

    // Nodemailer setup
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true, // true for port 465
          auth: {
            user: emailUser,
            pass: emailPass,
          },
        });

        const mailOptions = {
          from: `"Family Health" <${emailUser}>`,
          to: email.toLowerCase(),
          subject: "Reset your Password - Family Health",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px border #f0f0f0; border-radius: 8px;">
              <h2 style="color: #0D1B2A; text-align: center; font-family: serif;">Family Health</h2>
              <hr style="border: 0; border-top: 1px solid #eee;" />
              <p>Hello ${user.fullName},</p>
              <p>We received a request to reset your password. Please use the verification code below to proceed with the reset:</p>
              <div style="background-color: #f7f4ef; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
                <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #0D1B2A;">${otpCode}</span>
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you did not request a password reset, please ignore this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
              <p style="text-align: center; color: #999; font-size: 12px;">© 2026 Family Health●. All rights reserved.</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT]: Successfully sent OTP to ${email}`);
      } catch (mailError) {
        console.error("Failed to send email via nodemailer:", mailError);
        // We still return 200 since the OTP is generated in the DB and logged to the console
        return NextResponse.json(
          { 
            message: "OTP generated successfully, but real email delivery failed. (Check server terminal for OTP)",
            warning: "Mail configuration error"
          },
          { status: 200 }
        );
      }
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
