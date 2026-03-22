import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { registerSchema } from "@/lib/schemas";
import Business from "@/models/Business";

export async function POST(req: Request) {
  try {
    const json: unknown = await req.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const body = parsed.data;
    await connectDB();
    const existing = await Business.findOne({ email: body.email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "That email is already registered with GeoAttend." }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(body.password, 12);
    await Business.create({
      name: body.businessName,
      ownerName: body.ownerName,
      email: body.email.toLowerCase(),
      passwordHash,
      phone: body.phone,
      address: "",
      city: body.city,
      businessType: body.businessType,
      teamSize: body.teamSize,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not complete registration. Try again in a moment." }, { status: 500 });
  }
}
