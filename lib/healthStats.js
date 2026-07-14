import Review from "@/models/Review";
import Appointment from "@/models/Appointment";

export async function getAverageRating() {
  const result = await Review.aggregate([
    { $match: { isFlagged: false } },
    { $group: { _id: null, avg: { $avg: "$rating" } } },
  ]);
  return result.length > 0 ? result[0].avg : 0;
}

export async function getResponseRate() {
  const total = await Review.countDocuments({ isFlagged: false });
  if (total === 0) return 0;
  const replied = await Review.countDocuments({ 
    isFlagged: false,
    doctorReply: { $ne: null, $exists: true, $ne: "" }
  });
  return Math.round((replied / total) * 100);
}

export async function getAppointmentsToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return await Appointment.countDocuments({
    date: { $gte: today, $lt: tomorrow },
    status: { $ne: "cancelled" }
  });
}
