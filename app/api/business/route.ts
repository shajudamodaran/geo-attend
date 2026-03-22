import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { requireOwnerSession } from "@/lib/api-auth";
import { businessSettingsSchema } from "@/lib/schemas";
import Business from "@/models/Business";

export async function GET() {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const business = await Business.findById(session.user.businessId).lean();
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ business });
}

export async function PATCH(req: Request) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json: unknown = await req.json();
  const parsed = businessSettingsSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const u = parsed.data;
  await connectDB();
  const business = await Business.findById(session.user.businessId);
  if (!business) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (u.name !== undefined) business.name = u.name;
  if (u.address !== undefined) business.address = u.address;
  if (u.phone !== undefined) business.phone = u.phone;
  if (u.logoUrl !== undefined) business.logoUrl = u.logoUrl;
  if (u.geofenceRadius !== undefined) business.geofenceRadius = u.geofenceRadius;
  if (u.geofenceCenterLat !== undefined && u.geofenceCenterLng !== undefined) {
    business.geofenceCenter = { lat: u.geofenceCenterLat, lng: u.geofenceCenterLng };
  }
  if (u.workStartTime !== undefined) business.workStartTime = u.workStartTime;
  if (u.workEndTime !== undefined) business.workEndTime = u.workEndTime;
  if (u.graceMinutes !== undefined) business.graceMinutes = u.graceMinutes;
  if (u.workingDays !== undefined) business.workingDays = u.workingDays;
  if (u.notifications) {
    const n = u.notifications;
    const cur = business.notifications ?? {
      lateAlerts: true,
      absenceAlerts: true,
      weeklyReportEmail: false,
    };
    business.notifications = {
      lateAlerts: n.lateAlerts ?? cur.lateAlerts,
      absenceAlerts: n.absenceAlerts ?? cur.absenceAlerts,
      weeklyReportEmail: n.weeklyReportEmail ?? cur.weeklyReportEmail,
    };
  }
  await business.save();
  return NextResponse.json({ business });
}
