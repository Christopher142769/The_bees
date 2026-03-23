import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
const apiKey = process.env.CLOUDINARY_API_KEY || "";
const apiSecret = process.env.CLOUDINARY_API_SECRET || "";

const enabled = Boolean(cloudName && apiKey && apiSecret);

if (enabled) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

function inferFormatFromMime(mimetype = "") {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimetype.toLowerCase()] || "jpg";
}

export function isCloudinaryConfigured() {
  return enabled;
}

export function requireCloudinary() {
  if (!enabled) {
    throw new Error(
      "Cloudinary non configuré. Définissez CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET."
    );
  }
}

export async function uploadImageBuffer(file, folder) {
  requireCloudinary();
  if (!file?.buffer) {
    throw new Error("Fichier image invalide");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder,
        format: inferFormatFromMime(file.mimetype),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(file.buffer);
  });
}

export async function destroyImage(publicId) {
  requireCloudinary();
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}
