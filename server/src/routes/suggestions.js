import { Router } from "express";
import Suggestion from "../models/Suggestion.js";
import Member from "../models/Member.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { memberId, content, email } = req.body || {};
    if (!memberId || !content?.trim()) {
      return res.status(400).json({ error: "Membre et message requis" });
    }
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: "Membre introuvable" });
    }

    const isFemale = member.gender === "femme";
    if (isFemale) {
      if (!email || !String(email).trim().includes("@")) {
        return res.status(400).json({
          error: "Une adresse e-mail valide est requise pour ce membre.",
        });
      }
    }

    const suggestion = await Suggestion.create({
      memberId,
      content: String(content).trim(),
      email: isFemale ? String(email).trim() : "",
      isAnonymous: !isFemale,
    });

    res.status(201).json({
      ok: true,
      id: suggestion._id,
      message: isFemale
        ? "Merci, votre message a été transmis."
        : "Merci, votre message anonyme a été transmis.",
    });
  } catch (e) {
    res.status(400).json({ error: e.message || "Erreur" });
  }
});

router.get("/", requireAuth, async (_req, res) => {
  const list = await Suggestion.find()
    .populate("memberId", "name slug gender")
    .sort({ createdAt: -1 })
    .lean();
  res.json(list);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const r = await Suggestion.findByIdAndDelete(req.params.id);
  if (!r) return res.status(404).json({ error: "Introuvable" });
  res.json({ ok: true });
});

export default router;
