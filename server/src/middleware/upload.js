import multer from "multer";
const storage = multer.memoryStorage();

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
  storage,
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter: imageFilter,
});
