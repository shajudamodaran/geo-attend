import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { requireEmployeeSession, requireOwnerSession } from "@/lib/api-auth";
import { deriveStatus, formatDateKey } from "@/lib/attendance-helpers";
import { uploadBase64Image } from "@/lib/cloudinary";
import { checkInBodySchema, attendanceQuerySchema } from "@/lib/schemas";
import { isWithinGeofence } from "@/lib/geofence";
import Attendance from "@/models/Attendance";
import Business from "@/models/Business";
import Employee from "@/models/Employee";

export async function GET(req: Request) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const parsed = attendanceQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const q = parsed.data;
  await connectDB();
  const filter: Record<string, unknown> = { businessId: session.user.businessId };
  if (q.from && q.to) {
    filter.date = { $gte: q.from, $lte: q.to };
  } else if (q.from) {
    filter.date = { $gte: q.from };
  } else if (q.to) {
    filter.date = { $lte: q.to };
  }
  if (q.employeeId && mongoose.Types.ObjectId.isValid(q.employeeId)) {
    filter.employeeId = new mongoose.Types.ObjectId(q.employeeId);
  }
  if (q.status) {
    filter.status = q.status;
  }
  const skip = (q.page - 1) * q.limit;
  const [rows, total] = await Promise.all([
    Attendance.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(q.limit)
      .populate("employeeId", "name avatar phone role department")
      .lean(),
    Attendance.countDocuments(filter),
  ]);
  return NextResponse.json({ rows, total, page: q.page, limit: q.limit });
}

export async function POST(req: Request) {
  const session = await requireEmployeeSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json: unknown = await req.json();
  const parsed = checkInBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  if (body.employeeId !== session.user.employeeId) {
    return NextResponse.json({ error: "You can only check in for your own profile." }, { status: 403 });
  }
  await connectDB();
  const business = await Business.findById(session.user.businessId);
  const employee = await Employee.findById(session.user.employeeId);
  if (!business || !employee) {
    return NextResponse.json({ error: "Business or employee not found." }, { status: 404 });
  }
  const today = formatDateKey(new Date());
  const existing = await Attendance.findOne({
    businessId: session.user.businessId,
    employeeId: session.user.employeeId,
    date: today,
  });
  if (existing?.checkIn) {
    return NextResponse.json({ error: "You have already checked in today." }, { status: 409 });
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
  const checkInTime = new Date();
  const status = deriveStatus({
    checkInTime,
    workStartTime: business.workStartTime,
    graceMinutes: business.graceMinutes,
    hasCheckout: false,
  });
  const doc = await Attendance.findOneAndUpdate(
    { businessId: session.user.businessId, employeeId: session.user.employeeId, date: today },
    {
      $setOnInsert: { businessId: session.user.businessId, employeeId: session.user.employeeId, date: today },
      $set: {
        checkIn: {
          time: checkInTime,
          location: {
            lat: body.lat,
            lng: body.lng,
            accuracy: body.accuracy,
            address: body.address,
          },
          photo: photoUrl,
          isWithinGeofence: within,
          deviceInfo: body.deviceInfo,
        },
        status,
      },
    },
    { new: true, upsert: true },
  );
  return NextResponse.json({ attendance: doc });
}
