import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    heroImagePath: { type: String, default: "" },
    hiveImagePath: { type: String, default: "" },
    logoPath: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
