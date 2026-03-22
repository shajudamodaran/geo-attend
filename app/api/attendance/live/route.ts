import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { requireOwnerSession } from "@/lib/api-auth";
import { formatDateKey } from "@/lib/attendance-helpers";
import Attendance from "@/models/Attendance";
import Business from "@/models/Business";
import Employee from "@/models/Employee";

export async function GET() {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const today = formatDateKey(new Date());
  const [business, employees] = await Promise.all([
    Business.findById(session.user.businessId).lean(),
    Employee.find({ businessId: session.user.businessId, isActive: true }).sort({ name: 1 }).lean(),
  ]);
  const attendances = await Attendance.find({ businessId: session.user.businessId, date: today }).lean();
  const byEmp = new Map<string, (typeof attendances)[0]>();
  for (const a of attendances) {
    byEmp.set(String(a.employeeId), a);
  }
  const payload = employees.map((e) => {
    const a = byEmp.get(String(e._id));
    const checkedIn = Boolean(a?.checkIn && !a?.checkOut);
    return {
      employee: e,
      attendance: a ?? null,
      checkedIn,
    };
  });
  return NextResponse.json({
    date: today,
    items: payload,
    center: business?.geofenceCenter ?? { lat: 10.5276, lng: 76.2144 },
    radius: business?.geofenceRadius ?? 200,
  });
}
