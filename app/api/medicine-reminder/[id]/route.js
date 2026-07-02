import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import MedicineReminder from "@/models/MedicineReminder";
import ReminderLog from "@/models/ReminderLog";
import { getAuthenticatedUser } from "@/lib/auth";

// PUT: Edit medicine reminder or toggle isActive status
export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updatedReminder = await MedicineReminder.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    ).populate("memberId");

    if (!updatedReminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Reminder updated successfully", reminder: updatedReminder }, { status: 200 });
  } catch (error) {
    console.error("Error updating medicine reminder:", error);
    return NextResponse.json({ error: "Failed to update reminder" }, { status: 500 });
  }
}

// DELETE: Delete a medicine reminder
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deletedReminder = await MedicineReminder.findByIdAndDelete(id);

    if (!deletedReminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    // Also delete future logs associated with this reminder
    await ReminderLog.deleteMany({ reminderId: id, status: "Sent" });

    return NextResponse.json({ message: "Reminder deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting medicine reminder:", error);
    return NextResponse.json({ error: "Failed to delete reminder" }, { status: 500 });
  }
}
