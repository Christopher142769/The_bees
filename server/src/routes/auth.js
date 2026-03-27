import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = Router();
const LOGIN_CHALLENGE_TTL_MS = 5 * 60 * 1000;
const OTP_TTL_MS = 5 * 60 * 1000;
const loginChallenges = new Map();

function buildMailer() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const mailer = buildMailer();

function clearExpiredChallenges() {
  const now = Date.now();
  for (const [id, challenge] of loginChallenges.entries()) {
    if (challenge.expiresAt <= now) {
      loginChallenges.delete(id);
    }
  }
}

setInterval(clearExpiredChallenges, 60 * 1000).unref();

function hashInput(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function sendLoginCode(code) {
  if (!mailer) throw new Error("SMTP non configuré");
  const to = process.env.ADMIN_2FA_EMAIL || "christopherguidibi@gmail.com";
  await mailer.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Code de connexion Dashboard The BEES",
    text: `Votre code de confirmation est: ${code}\nCe code expire dans 5 minutes.`,
    html: `<p>Votre code de confirmation est: <strong>${code}</strong></p><p>Ce code expire dans 5 minutes.</p>`,
  });
}

router.post("/login/start", async (req, res) => {
  const { password } = req.body || {};
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminPasswordHash) {
    return res.status(500).json({ error: "ADMIN_PASSWORD_HASH non configuré" });
  }
  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ error: "Hash requis" });
  }
  const ok = password.trim() === adminPasswordHash;
  if (!ok) {
    return res.status(401).json({ error: "Hash incorrect" });
  }
  try {
    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const challengeId = crypto.randomUUID();
    const now = Date.now();
    loginChallenges.set(challengeId, {
      codeHash: hashInput(code),
      expiresAt: now + OTP_TTL_MS,
    });
    await sendLoginCode(code);
    return res.json({
      challengeId,
      expiresAt: now + LOGIN_CHALLENGE_TTL_MS,
    });
  } catch {
    return res.status(500).json({ error: "Impossible d'envoyer le code de confirmation" });
  }
});

router.post("/login/verify", async (req, res) => {
  const { challengeId, code } = req.body || {};
  if (!challengeId || typeof challengeId !== "string") {
    return res.status(400).json({ error: "Challenge invalide" });
  }
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code requis" });
  }
  const challenge = loginChallenges.get(challengeId);
  if (!challenge) {
    return res.status(401).json({ error: "Code expire ou invalide" });
  }
  loginChallenges.delete(challengeId);
  if (Date.now() > challenge.expiresAt) {
    return res.status(401).json({ error: "Code expire" });
  }
  if (hashInput(code) !== challenge.codeHash) {
    return res.status(401).json({ error: "Code invalide" });
  }
  const now = Date.now();
  const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
  res.json({
    token,
    expiresAt: now + 5 * 60 * 1000,
  });
});

router.post("/login", async (_req, res) => {
  return res.status(410).json({
    error: "Ancien endpoint desactive. Utilisez /api/auth/login/start puis /verify.",
  });
});

export default router;
