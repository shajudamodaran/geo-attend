import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { requireOwnerSession } from "@/lib/api-auth";
import { employeeCreateSchema } from "@/lib/schemas";
import Employee from "@/models/Employee";

export async function GET() {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const list = await Employee.find({ businessId: session.user.businessId }).sort({ name: 1 }).lean();
  return NextResponse.json({ employees: list });
}

export async function POST(req: Request) {
  const session = await requireOwnerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json: unknown = await req.json();
  const parsed = employeeCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const body = parsed.data;
  await connectDB();
  const checkInPinHash = await bcrypt.hash(body.checkInPin, 10);
  try {
    const doc = await Employee.create({
      businessId: session.user.businessId,
      name: body.name,
      phone: body.phone,
      email: body.email || undefined,
      role: body.role,
      department: body.department,
      joiningDate: new Date(body.joiningDate),
      checkInPinHash,
    });
    return NextResponse.json({ employee: doc });
  } catch {
    return NextResponse.json(
      { error: "Could not add team member. Check that the phone number is unique for your business." },
      { status: 400 },
    );
  }
}
