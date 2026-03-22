import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { requireOwnerSession } from "@/lib/api-auth";
import { formatDateKey } from "@/lib/attendance-helpers";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export async function GET() {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const businessId = new mongoose.Types.ObjectId(session.user.businessId);
  const today = formatDateKey(new Date());
  const activeEmployees = await Employee.countDocuments({ businessId, isActive: true });
  const todayRows = await Attendance.find({ businessId, date: today }).lean();
  const todayPresent = todayRows.filter((r) => r.checkIn).length;
  const todayAbsent = Math.max(0, activeEmployees - todayPresent);
  const currentlyCheckedIn = todayRows.filter((r) => r.checkIn && !r.checkOut).length;
  const lateArrivals = todayRows.filter((r) => r.status === "late").length;

  const start = addDays(new Date(), -13);
  const from = formatDateKey(start);
  const last14 = await Attendance.aggregate([
    { $match: { businessId, date: { $gte: from, $lte: today } } },
    {
      $group: {
        _id: "$date",
        present: {
          $sum: {
            $cond: [{ $in: ["$status", ["present", "late", "half_day"]] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthFrom = formatDateKey(monthStart);
  const monthRows = await Attendance.find({
    businessId,
    date: { $gte: monthFrom, $lte: today },
    checkIn: { $exists: true },
  }).lean();
  const outsideCount = monthRows.filter((r) => r.checkIn && r.checkIn.isWithinGeofence === false).length;
  const savingsInr = outsideCount * 300;

  const perfAgg = await Attendance.aggregate([
    { $match: { businessId, date: { $gte: from, $lte: today } } },
    {
      $group: {
        _id: "$employeeId",
        score: {
          $sum: {
            $cond: [{ $eq: ["$status", "present"] }, 1, 0],
          },
        },
      },
    },
    { $sort: { score: -1 } },
    { $limit: 1 },
  ]);
  let topPerformer: { name: string; score: number } | null = null;
  if (perfAgg[0]?._id) {
    const emp = await Employee.findById(perfAgg[0]._id).lean();
    if (emp) {
      topPerformer = { name: emp.name, score: perfAgg[0].score as number };
    }
  }

  const recent = await Attendance.find({ businessId, date: today, checkIn: { $exists: true } })
    .sort({ "checkIn.time": -1 })
    .limit(12)
    .populate("employeeId", "name avatar role")
    .lean();

  return NextResponse.json({
    cards: {
      todayPresent,
      todayAbsent,
      currentlyCheckedIn,
      lateArrivals,
      savingsInr,
    },
    chart14: last14.map((d) => ({ date: d._id, present: d.present })),
    topPerformer,
    recent,
  });
}
