import { Router } from "express";
import fs from "fs";
import path from "path";
import Media from "../models/Media.js";
import SiteSettings from "../models/SiteSettings.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadMediaFile, uploadDir } from "../middleware/upload.js";

const router = Router();

function fileFromPublicPath(publicPath) {
  const rel = publicPath.replace(/^\/uploads\//, "");
  return path.join(uploadDir, rel);
}

router.get("/", requireAuth, async (_req, res) => {
  const list = await Media.find().sort({ createdAt: -1 }).lean();
  res.json(list);
});

router.post(
  "/",
  requireAuth,
  (req, res, next) => {
    uploadMediaFile.single("file")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Fichier requis" });
    }
    const publicPath = `/uploads/media/${req.file.filename}`;
    const doc = await Media.create({
      path: publicPath,
      originalName: req.file.originalname || "",
    });
    res.status(201).json(doc);
  }
);

router.delete("/:id", requireAuth, async (req, res) => {
  const doc = await Media.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: "Introuvable" });

  const settings = await SiteSettings.findOne();
  if (settings) {
    const patch = {};
    if (settings.heroImagePath === doc.path) patch.heroImagePath = "";
    if (settings.hiveImagePath === doc.path) patch.hiveImagePath = "";
    if (Object.keys(patch).length) {
      await SiteSettings.updateOne({ _id: settings._id }, { $set: patch });
    }
  }

  const full = fileFromPublicPath(doc.path);
  try {
    if (fs.existsSync(full)) fs.unlinkSync(full);
  } catch {
    /* ignore */
  }
  await doc.deleteOne();
  res.json({ ok: true });
});

export default router;
