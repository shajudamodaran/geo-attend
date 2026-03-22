import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { requireOwnerSession } from "@/lib/api-auth";
import { buildAttendancePdf } from "@/lib/pdf-generator";
import { reportsPdfQuerySchema } from "@/lib/schemas";
import type { AttendanceStatus } from "@/types";
import Attendance from "@/models/Attendance";
import Business from "@/models/Business";
import Employee from "@/models/Employee";

export async function GET(req: Request) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const parsed = reportsPdfQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { from, to, employeeIds } = parsed.data;
  await connectDB();
  const business = await Business.findById(session.user.businessId).lean();
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const filter: Record<string, unknown> = {
    businessId: new mongoose.Types.ObjectId(session.user.businessId),
    date: { $gte: from, $lte: to },
  };
  if (employeeIds) {
    const ids = employeeIds.split(",").filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (ids.length) {
      filter.employeeId = { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) };
    }
  }
  const rows = await Attendance.find(filter).sort({ date: -1 }).lean();
  const employees = await Employee.find({ businessId: session.user.businessId }).lean();
  const nameById = new Map<string, string>();
  for (const e of employees) {
    nameById.set(String(e._id), e.name);
  }
  const summaryMap = new Map<
    string,
    { name: string; daysPresent: number; daysAbsent: number; daysLate: number; totalHours: number }
  >();
  for (const e of employees) {
    summaryMap.set(String(e._id), {
      name: e.name,
      daysPresent: 0,
      daysAbsent: 0,
      daysLate: 0,
      totalHours: 0,
    });
  }
  for (const r of rows) {
    const key = String(r.employeeId);
    const row = summaryMap.get(key);
    if (!row) continue;
    if (r.status === "present") row.daysPresent += 1;
    else if (r.status === "late") row.daysLate += 1;
    else if (r.status === "absent") row.daysAbsent += 1;
    else if (r.status === "half_day") row.daysPresent += 0.5;
    row.totalHours += r.totalHours ?? 0;
  }

  const logs = rows.map((r) => {
    const name = nameById.get(String(r.employeeId)) ?? "Team member";
    const cin = r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "—";
    const cout = r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }) : "—";
    const loc = r.checkIn?.location?.address
      ? `${r.checkIn.location.address} (${r.checkIn.location.lat.toFixed(5)}, ${r.checkIn.location.lng.toFixed(5)})`
      : r.checkIn
        ? `${r.checkIn.location.lat.toFixed(5)}, ${r.checkIn.location.lng.toFixed(5)}`
        : "—";
    return {
      employee: name,
      date: r.date,
      checkIn: cin,
      checkOut: cout,
      hours: r.totalHours != null ? String(r.totalHours) : "—",
      status: r.status as AttendanceStatus,
      location: loc,
    };
  });

  const doc = buildAttendancePdf({
    businessName: business.name,
    generatedAt: new Date(),
    summary: [...summaryMap.values()],
    logs,
  });
  const buf = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="geoattend-report-${from}-${to}.pdf"`,
    },
  });
}
