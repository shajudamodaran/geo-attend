import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadBase64Image } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.businessId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const json: unknown = await req.json();
  if (!json || typeof json !== "object" || !("dataUrl" in json)) {
    return NextResponse.json({ error: "Expected { dataUrl }" }, { status: 400 });
  }
  const dataUrl = (json as { dataUrl: unknown }).dataUrl;
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) {
    return NextResponse.json({ error: "Invalid image payload" }, { status: 400 });
  }
  try {
    const url = await uploadBase64Image(dataUrl, "geoattend/uploads");
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed. Try a smaller photo or check Cloudinary settings." }, { status: 500 });
  }
}
