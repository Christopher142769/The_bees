import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");
const mediaDir = path.join(uploadDir, "media");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const storageMedia = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, mediaDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const imageFilter = (_req, file, cb) => {
  const ok = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);
  if (ok) cb(null, true);
  else cb(new Error("Format image requis (jpeg, png, webp, gif)"));
};

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export const uploadMediaFile = multer({
  storage: storageMedia,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: imageFilter,
});

export { uploadDir, mediaDir };
