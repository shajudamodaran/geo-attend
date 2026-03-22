import { v2 as cloudinary } from "cloudinary";

const configured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadBase64Image(dataUrl: string, folder = "geoattend"): Promise<string> {
  if (!configured) {
    return dataUrl;
  }
  const res = await cloudinary.uploader.upload(dataUrl, { folder, resource_type: "image" });
  return res.secure_url;
}

export function isCloudinaryConfigured(): boolean {
  return configured;
}
