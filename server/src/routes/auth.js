import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req, res) => {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: "ADMIN_PASSWORD non configuré" });
  }
  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ error: "Mot de passe requis" });
  }
  const ok = password === adminPassword;
  if (!ok) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.json({ token });
});

export default router;
