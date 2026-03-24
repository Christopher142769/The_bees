import { Router } from "express";
import SiteSettings from "../models/SiteSettings.js";
import Media from "../models/Media.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadPhoto } from "../middleware/upload.js";
import {
  destroyImage,
  isCloudinaryConfigured,
  uploadImageBuffer,
} from "../lib/cloudinary.js";
import { DEFAULT_ACTION_PLAN_TEXT } from "../lib/defaultActionPlan.js";

const router = Router();

async function getDoc() {
  let doc = await SiteSettings.findOne();
  if (!doc) {
    doc = await SiteSettings.create({});
  }
  return doc;
}

router.get("/", async (_req, res) => {
  const doc = await getDoc();
  res.json({
    heroImagePath: doc.heroImagePath || "",
    hiveImagePath: doc.hiveImagePath || "",
    logoPath: doc.logoPath || "",
    actionPlanText: doc.actionPlanText || DEFAULT_ACTION_PLAN_TEXT,
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
    try {
      if (!isCloudinaryConfigured()) {
        return res
          .status(500)
          .json({ error: "Cloudinary non configuré côté serveur" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "Fichier logo requis" });
      }
      const doc = await getDoc();
      const result = await uploadImageBuffer(req.file, "the-bees/logo");
      const oldPublicId = doc.logoPublicId;
      doc.logoPath = result.secure_url;
      doc.logoPublicId = result.public_id;
      await doc.save();
      if (oldPublicId && oldPublicId !== result.public_id) {
        try {
          await destroyImage(oldPublicId);
        } catch {
          /* ignore */
        }
      }
      res.json({
        heroImagePath: doc.heroImagePath || "",
        hiveImagePath: doc.hiveImagePath || "",
        logoPath: doc.logoPath || "",
        actionPlanText: doc.actionPlanText || DEFAULT_ACTION_PLAN_TEXT,
      });
    } catch (e) {
      res.status(400).json({ error: e.message || "Upload impossible" });
    }
  }
);

router.patch("/", requireAuth, async (req, res) => {
  const { heroImagePath, hiveImagePath, logoPath, actionPlanText } = req.body || {};
  const update = {};

  async function validateMediaPath(p) {
    if (p === "" || p == null) return "";
    if (typeof p !== "string") {
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
        const oldPublicId = doc.logoPublicId;
        update.logoPath = "";
        update.logoPublicId = "";
        if (oldPublicId) {
          try {
            await destroyImage(oldPublicId);
          } catch {
            /* ignore */
          }
        }
      } else {
        return res.status(400).json({ error: "Utilisez POST /logo pour le logo" });
      }
    }
    if (actionPlanText !== undefined) {
      if (typeof actionPlanText !== "string") {
        throw new Error("Le plan d'action doit etre un texte");
      }
      update.actionPlanText = actionPlanText.trim()
        ? actionPlanText
        : DEFAULT_ACTION_PLAN_TEXT;
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
      actionPlanText: doc.actionPlanText || DEFAULT_ACTION_PLAN_TEXT,
    });
  } catch (e) {
    res.status(400).json({ error: e.message || "Erreur" });
  }
});

export default router;
