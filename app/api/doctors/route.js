import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Doctor from "@/models/Doctor";

export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const specialty = searchParams.get("specialty");
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit")) || 20;
    const page = parseInt(searchParams.get("page")) || 1;
    const skip = (page - 1) * limit;

    // Build query
    const query = { 
      status: "approved",
      isVerified: true,
      isSuspended: { $ne: true }
    };

    // Filter by specialty
    if (specialty) {
      query.specialty = { $regex: new RegExp(specialty, 'i') };
    }

    // Filter by city (location)
    if (city) {
      query.$or = [
        { city: { $regex: new RegExp(city, 'i') } },
        { "address.city": { $regex: new RegExp(city, 'i') } }
      ];
    }

    // Search by name, hospital, or specialty
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = query.$or || [];
      query.$or.push(
        { name: searchRegex },
        { hospital: searchRegex },
        { specialty: searchRegex }
      );
    }

    // Get total count
    const total = await Doctor.countDocuments(query);

    // Get doctors
    const doctors = await Doctor.find(query)
      .select('name email phone specialty experience hospital city address consultationFee videoConsultFee about tagline languages conditions education awards appointmentSlots avatarColor isVerified rating reviewCount')
      .sort({ rating: -1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Format response
    const formattedDoctors = doctors.map(doctor => ({
      _id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      experience: doctor.experience || 0,
      hospital: doctor.hospital || '',
      city: doctor.city || doctor.address?.city || '',
      address: doctor.address || {},
      consultationFee: doctor.consultationFee || 0,
      videoConsultFee: doctor.videoConsultFee || 0,
      about: doctor.about || '',
      tagline: doctor.tagline || '',
      languages: doctor.languages || [],
      conditions: doctor.conditions || [],
      education: doctor.education || [],
      awards: doctor.awards || [],
      appointmentSlots: doctor.appointmentSlots || [],
      avatarColor: doctor.avatarColor || '#6B7280',
      isVerified: doctor.isVerified || false,
      rating: doctor.rating || 0,
      reviewCount: doctor.reviewCount || 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        doctors: formattedDoctors,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filters: {
          specialty,
          city,
          search,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch doctors' 
      },
      { status: 500 }
    );
  }
}