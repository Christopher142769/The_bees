import { Router } from "express";
import fs from "fs";
import path from "path";
import SiteSettings from "../models/SiteSettings.js";
import Media from "../models/Media.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadPhoto, uploadDir } from "../middleware/upload.js";

const router = Router();

async function getDoc() {
  let doc = await SiteSettings.findOne();
  if (!doc) {
    doc = await SiteSettings.create({});
  }
  return doc;
}

function absFromPublic(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/")) return null;
  const rel = publicPath.replace(/^\/uploads\//, "");
  return path.join(uploadDir, rel);
}

router.get("/", async (_req, res) => {
  const doc = await getDoc();
  res.json({
    heroImagePath: doc.heroImagePath || "",
    hiveImagePath: doc.hiveImagePath || "",
    logoPath: doc.logoPath || "",
  });
});

router.post(
  "/logo",
  requireAuth,
  (req, res, next) => {
    uploadPhoto.single("logo")(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Fichier logo requis" });
    }
    const doc = await getDoc();
    const oldPath = doc.logoPath;
    const newPath = `/uploads/${req.file.filename}`;
    doc.logoPath = newPath;
    await doc.save();
    if (oldPath && oldPath !== newPath) {
      const full = absFromPublic(oldPath);
      try {
        if (full && fs.existsSync(full)) fs.unlinkSync(full);
      } catch {
        /* ignore */
      }
    }
    res.json({
      heroImagePath: doc.heroImagePath || "",
      hiveImagePath: doc.hiveImagePath || "",
      logoPath: doc.logoPath || "",
    });
  }
);

router.patch("/", requireAuth, async (req, res) => {
  const { heroImagePath, hiveImagePath, logoPath } = req.body || {};
  const update = {};

  async function validateMediaPath(p) {
    if (p === "" || p == null) return "";
    if (typeof p !== "string" || !p.startsWith("/uploads/media/")) {
      throw new Error("Chemin média invalide");
    }
    const exists = await Media.findOne({ path: p });
    if (!exists) throw new Error("Média introuvable");
    return p;
  }

  try {
    if (heroImagePath !== undefined) {
      update.heroImagePath = await validateMediaPath(heroImagePath);
    }
    if (hiveImagePath !== undefined) {
      update.hiveImagePath = await validateMediaPath(hiveImagePath);
    }
    if (logoPath !== undefined) {
      if (logoPath === "" || logoPath === null) {
        const doc = await getDoc();
        const old = doc.logoPath;
        update.logoPath = "";
        if (old) {
          const full = absFromPublic(old);
          try {
            if (full && fs.existsSync(full)) fs.unlinkSync(full);
          } catch {
            /* ignore */
          }
        }
      } else {
        return res.status(400).json({ error: "Utilisez POST /logo pour le logo" });
      }
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }
    const doc = await SiteSettings.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({
      heroImagePath: doc.heroImagePath || "",
      hiveImagePath: doc.hiveImagePath || "",
      logoPath: doc.logoPath || "",
    });
  } catch (e) {
    res.status(400).json({ error: e.message || "Erreur" });
  }
});

export default router;
