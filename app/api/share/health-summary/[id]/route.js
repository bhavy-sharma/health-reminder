import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import HealthRecord from "@/models/HealthRecord";
import Share from "@/models/Share";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = await params;

    // ─── Get the share data using the ID directly ───
    const shareData = await Share.findById(id);

    if (!shareData) {
      return NextResponse.json(
        { error: "Share not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const recordId = searchParams.get("recordId");

    if (recordId) {
      // Download logic...
      const record = await HealthRecord.findById(recordId);
      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      try {
        const response = await fetch(record.fileUrl.split('?')[0]);
        if (!response.ok) {
          return NextResponse.json({
            success: false,
            error: "File not accessible",
            downloadUrl: record.fileUrl.split('?')[0],
            manualDownload: true,
          }, { status: 200 });
        }

        const fileBuffer = await response.arrayBuffer();
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': record.mimeType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${record.documentName || 'document'}.pdf"`,
          },
        });
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to download file" },
          { status: 500 }
        );
      }
    }

    // ─── Get the familyId and memberId from shareData ───
    const familyId = shareData.familyId;
    const memberId = shareData.memberId;

    // Fetch health records for this member
    const healthRecords = await HealthRecord.find({
      familyId: familyId,
      memberId: memberId,
      isActive: true,
    }).sort({ documentDate: -1 });

    return NextResponse.json({
      success: true,
      data: {
        patient: shareData.patient || {
          name: 'Unknown',
          age: 'N/A',
          gender: 'N/A',
          bloodGroup: 'N/A',
          allergies: [],
        },
        doctor: shareData.doctor || {
          name: 'Not specified',
          specialty: 'N/A',
          hospital: 'N/A',
          city: 'N/A',
          consultationFee: 0,
        },
        visit: shareData.visit || {
          date: 'Not specified',
          time: 'Not specified',
          reason: 'Not specified',
        },
        generatedAt: shareData.generatedAt || new Date().toISOString(),
        healthRecords: healthRecords.map(r => ({
          id: r._id,
          title: r.documentName,
          category: r.documentType,
          date: r.documentDate,
          fileUrl: r.fileUrl,
          filePublicId: r.filePublicId,
          mimeType: r.mimeType,
          fileSizeKB: r.fileSizeKB,
        })),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch" },
      { status: 500 }
    );
  }
}