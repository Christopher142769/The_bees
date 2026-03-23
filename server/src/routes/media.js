import { Router } from "express";
import Media from "../models/Media.js";
import SiteSettings from "../models/SiteSettings.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadMediaFile } from "../middleware/upload.js";
import {
  destroyImage,
  isCloudinaryConfigured,
  uploadImageBuffer,
} from "../lib/cloudinary.js";

const router = Router();

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
    try {
      if (!isCloudinaryConfigured()) {
        return res
          .status(500)
          .json({ error: "Cloudinary non configuré côté serveur" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Fichier requis" });
      }
      const result = await uploadImageBuffer(req.file, "the-bees/media");
      const doc = await Media.create({
        path: result.secure_url,
        publicId: result.public_id,
        originalName: req.file.originalname || "",
      });
      res.status(201).json(doc);
    } catch (e) {
      res.status(400).json({ error: e.message || "Upload impossible" });
    }
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

  try {
    await destroyImage(doc.publicId);
  } catch {
    /* ignore */
  }
  await doc.deleteOne();
  res.json({ ok: true });
});

export default router;
