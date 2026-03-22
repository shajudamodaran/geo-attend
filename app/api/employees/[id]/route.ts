import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { requireOwnerSession } from "@/lib/api-auth";
import { employeeUpdateSchema } from "@/lib/schemas";
import Attendance from "@/models/Attendance";
import Employee from "@/models/Employee";

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: RouteCtx) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await connectDB();
  const employee = await Employee.findOne({
    _id: id,
    businessId: session.user.businessId,
  }).lean();
  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const statsAgg = await Attendance.aggregate([
    { $match: { businessId: new mongoose.Types.ObjectId(session.user.businessId), employeeId: new mongoose.Types.ObjectId(id) } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);
  const stats = {
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
  };
  for (const row of statsAgg) {
    const k = row._id as keyof typeof stats;
    if (k in stats) stats[k] = row.count;
  }
  const recent = await Attendance.find({ employeeId: id, businessId: session.user.businessId })
    .sort({ date: -1 })
    .limit(20)
    .lean();
  return NextResponse.json({ employee, stats, recent });
}

export async function PATCH(req: Request, ctx: RouteCtx) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const json: unknown = await req.json();
  const parsed = employeeUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  await connectDB();
  const employee = await Employee.findOne({ _id: id, businessId: session.user.businessId });
  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const u = parsed.data;
  if (u.name !== undefined) employee.name = u.name;
  if (u.phone !== undefined) employee.phone = u.phone;
  if (u.email !== undefined) employee.email = u.email || undefined;
  if (u.role !== undefined) employee.role = u.role;
  if (u.department !== undefined) employee.department = u.department;
  if (u.joiningDate !== undefined) employee.joiningDate = new Date(u.joiningDate);
  if (u.isActive !== undefined) employee.isActive = u.isActive;
  if (u.checkInPin !== undefined) {
    employee.checkInPinHash = await bcrypt.hash(u.checkInPin, 10);
  }
  await employee.save();
  return NextResponse.json({ employee });
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await connectDB();
  const employee = await Employee.findOne({ _id: id, businessId: session.user.businessId });
  if (!employee) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  employee.isActive = false;
  await employee.save();
  return NextResponse.json({ ok: true });
}
