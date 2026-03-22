import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { requireEmployeeSession } from "@/lib/api-auth";
import { deriveStatus } from "@/lib/attendance-helpers";
import { uploadBase64Image } from "@/lib/cloudinary";
import { checkOutBodySchema } from "@/lib/schemas";
import { isWithinGeofence } from "@/lib/geofence";
import Attendance from "@/models/Attendance";
import Business from "@/models/Business";

type RouteCtx = { params: Promise<{ id: string }> };

function hoursBetween(a: Date, b: Date): number {
  return Math.max(0, (b.getTime() - a.getTime()) / (1000 * 60 * 60));
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const session = await requireEmployeeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const json: unknown = await req.json();
  const parsed = checkOutBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  await connectDB();
  const attendance = await Attendance.findOne({
    _id: id,
    businessId: session.user.businessId,
    employeeId: session.user.employeeId,
  });
  if (!attendance?.checkIn) {
    return NextResponse.json({ error: "Check-in not found for this record." }, { status: 404 });
  }
  if (attendance.checkOut) {
    return NextResponse.json({ error: "You have already checked out." }, { status: 409 });
  }
  const business = await Business.findById(session.user.businessId);
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }
  const within = isWithinGeofence(
    business.geofenceCenter.lat,
    business.geofenceCenter.lng,
    business.geofenceRadius,
    body.lat,
    body.lng,
  );
  let photoUrl: string | undefined;
  if (body.photoDataUrl?.startsWith("data:image")) {
    photoUrl = await uploadBase64Image(body.photoDataUrl);
  }
  const checkOutTime = new Date();
  const hours = hoursBetween(new Date(attendance.checkIn.time), checkOutTime);
  const status = deriveStatus({
    checkInTime: new Date(attendance.checkIn.time),
    workStartTime: business.workStartTime,
    graceMinutes: business.graceMinutes,
    hasCheckout: true,
    hoursWorked: hours,
  });
  attendance.checkOut = {
    time: checkOutTime,
    location: {
      lat: body.lat,
      lng: body.lng,
      accuracy: body.accuracy,
      address: body.address,
    },
    photo: photoUrl,
    isWithinGeofence: within,
    deviceInfo: body.deviceInfo,
  };
  attendance.totalHours = Math.round(hours * 10) / 10;
  attendance.status = status;
  await attendance.save();
  return NextResponse.json({ attendance });
}
