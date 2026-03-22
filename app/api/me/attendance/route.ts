import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { requireEmployeeSession } from "@/lib/api-auth";
import Attendance from "@/models/Attendance";

export async function GET() {
  const session = await requireEmployeeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const rows = await Attendance.find({
    businessId: session.user.businessId,
    employeeId: session.user.employeeId,
  })
    .sort({ date: -1 })
    .limit(120)
    .lean();
  return NextResponse.json({ rows });
}
