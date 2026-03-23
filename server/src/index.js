import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import membersRoutes from "./routes/members.js";
import suggestionsRoutes from "./routes/suggestions.js";
import mediaRoutes from "./routes/media.js";
import settingsRoutes from "./routes/settings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/the-bees";

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/suggestions", suggestionsRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

/* Frontend production (Render, etc.) : fichiers statiques + SPA */
const clientDist = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api\/).*/, (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(clientDist, "index.html"), (err) => next(err));
  });
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("MongoDB connecté");
  app.listen(PORT, () => {
    const mode = fs.existsSync(clientDist) ? "API + site statique" : "API seule";
    console.log(`The BEES (${mode}) → port ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
