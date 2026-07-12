// app/api/doctor/auth/signup/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    await connectToDatabase();

    const {
      name,
      email,
      phone,
      specialty,
      medicalRegNo,
      experience,
      hospital,
      city,
      consultFee,
      password,
      medicalCertificate, // New field
    } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !specialty || !medicalRegNo || !password) {
      return NextResponse.json(
        { error: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    // Validate medical certificate
    if (!medicalCertificate || !medicalCertificate.url) {
      return NextResponse.json(
        { error: "Please upload your medical practitioner certificate" },
        { status: 400 }
      );
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return NextResponse.json(
        { error: "A doctor with this email already exists" },
        { status: 400 }
      );
    }

    // Check if medical registration number is already used
    const existingReg = await Doctor.findOne({ medicalRegNo });
    if (existingReg) {
      return NextResponse.json(
        { error: "This medical registration number is already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor with pending status
    const doctor = new Doctor({
      name,
      email: email.toLowerCase(),
      phone,
      specialty,
      medicalRegNo,
      experience: experience || 0,
      hospital: hospital || "",
      city: city || "",
      consultationFee: consultFee || 0,
      password: hashedPassword,
      medicalCertificate: {
        url: medicalCertificate.url,
        publicId: medicalCertificate.publicId,
        fileName: medicalCertificate.fileName,
        fileType: medicalCertificate.fileType,
        uploadedAt: new Date(),
      },
      status: "pending",
      isVerified: false,
    });

    await doctor.save();

    // Remove password from response
    const doctorResponse = doctor.toObject();
    delete doctorResponse.password;

    return NextResponse.json(
      {
        success: true,
        message: "Doctor registration request submitted for admin approval",
        data: doctorResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Doctor signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register doctor" },
      { status: 500 }
    );
  }
}