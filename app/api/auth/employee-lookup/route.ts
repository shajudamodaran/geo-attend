import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import { normalizePhoneDigits } from "@/lib/phone";
import { employeeLookupSchema } from "@/lib/schemas";
import Business from "@/models/Business";
import Employee from "@/models/Employee";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = employeeLookupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const normalized = normalizePhoneDigits(parsed.data.phone);
  if (normalized.length !== 10) {
    return NextResponse.json({ matches: [] as const });
  }

  await connectDB();
  const candidates = await Employee.find({ phone: normalized, isActive: true }).lean();
  const verified: { businessId: string; employeeName: string }[] = [];
  const seenBusiness = new Set<string>();

  for (const emp of candidates) {
    if (!emp.checkInPinHash) continue;
    const ok = await bcrypt.compare(parsed.data.pin, emp.checkInPinHash);
    if (!ok) continue;
    const bid = String(emp.businessId);
    if (seenBusiness.has(bid)) continue;
    seenBusiness.add(bid);
    verified.push({ businessId: bid, employeeName: emp.name });
  }

  if (verified.length === 0) {
    return NextResponse.json({ matches: [] as const });
  }

  const businessIds = verified.map((v) => v.businessId);
  const businesses = await Business.find({ _id: { $in: businessIds } })
    .select("name")
    .lean();
  const nameById = new Map(businesses.map((b) => [String(b._id), b.name as string]));

  const matches = verified
    .map((v) => {
      const name = nameById.get(v.businessId);
      if (!name) return null;
      return {
        businessId: v.businessId,
        businessName: name,
        employeeName: v.employeeName,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return NextResponse.json({ matches });
}
