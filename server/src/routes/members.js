import { Router } from "express";
import Member from "../models/Member.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadPhoto } from "../middleware/upload.js";
import { slugify } from "../lib/slug.js";
import {
  destroyImage,
  isCloudinaryConfigured,
  uploadImageBuffer,
} from "../lib/cloudinary.js";

const router = Router();

async function uniqueSlug(base, excludeId = null) {
  let slug = base || "membre";
  let n = 0;
  for (;;) {
    const candidate = n ? `${slug}-${n}` : slug;
    const q = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await Member.findOne(q);
    if (!exists) return candidate;
    n += 1;
  }
}

router.get("/", async (_req, res) => {
  const members = await Member.find().sort({ order: 1, name: 1 }).lean();
  res.json(members);
});

router.get("/:slug", async (req, res) => {
  const member = await Member.findOne({ slug: req.params.slug }).lean();
  if (!member) return res.status(404).json({ error: "Membre introuvable" });
  res.json(member);
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, role, gender, order, ...answers } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: "Le nom est requis" });
    }
    const base = slugify(name);
    const slug = await uniqueSlug(base);
    const member = await Member.create({
      name: name.trim(),
      role: role?.trim() || "",
      gender: gender || "autre",
      slug,
      order: Number(order) || 0,
      quiJeSuis: answers.quiJeSuis || "",
      ceQuiMeMotive: answers.ceQuiMeMotive || "",
      mesForces: answers.mesForces || "",
      quandMeVoir: answers.quandMeVoir || "",
      vision: answers.vision || "",
    });
    res.status(201).json(member);
  } catch (e) {
    res.status(400).json({ error: e.message || "Erreur création" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ error: "Introuvable" });

    const {
      name,
      role,
      gender,
      order,
      quiJeSuis,
      ceQuiMeMotive,
      mesForces,
      quandMeVoir,
      vision,
    } = req.body;

    if (name !== undefined) member.name = String(name).trim();
    if (role !== undefined) member.role = String(role).trim();
    if (gender !== undefined && ["femme", "homme", "autre"].includes(gender)) {
      member.gender = gender;
    }
    if (order !== undefined) member.order = Number(order) || 0;
    if (quiJeSuis !== undefined) member.quiJeSuis = String(quiJeSuis);
    if (ceQuiMeMotive !== undefined) member.ceQuiMeMotive = String(ceQuiMeMotive);
    if (mesForces !== undefined) member.mesForces = String(mesForces);
    if (quandMeVoir !== undefined) member.quandMeVoir = String(quandMeVoir);
    if (vision !== undefined) member.vision = String(vision);

    if (name !== undefined) {
      member.slug = await uniqueSlug(slugify(member.name), member._id);
    }

    await member.save();
    res.json(member);
  } catch (e) {
    res.status(400).json({ error: e.message || "Erreur mise à jour" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const r = await Member.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ error: "Introuvable" });
  if (r.photoPublicId) {
    try {
      await destroyImage(r.photoPublicId);
    } catch {
      /* ignore */
    }
  }
  res.json({ ok: true });
});

router.post(
  "/:id/photo",
  requireAuth,
  (req, res, next) => {
    uploadPhoto.single("photo")(req, res, (err) => {
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
        return res.status(400).json({ error: "Fichier photo requis" });
      }
      const member = await Member.findById(req.params.id);
      if (!member) return res.status(404).json({ error: "Membre introuvable" });
      const result = await uploadImageBuffer(req.file, "the-bees/members");
      const oldPublicId = member.photoPublicId;
      member.photoPath = result.secure_url;
      member.photoPublicId = result.public_id;
      await member.save();
      if (oldPublicId && oldPublicId !== result.public_id) {
        try {
          await destroyImage(oldPublicId);
        } catch {
          /* ignore */
        }
      }
      res.json(member);
    } catch (e) {
      res.status(400).json({ error: e.message || "Upload impossible" });
    }
  }
);

export default router;
