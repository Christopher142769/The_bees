import mongoose from "mongoose";
import { DEFAULT_ACTION_PLAN_TEXT } from "../lib/defaultActionPlan.js";

const siteSettingsSchema = new mongoose.Schema(
  {
    heroImagePath: { type: String, default: "" },
    hiveImagePath: { type: String, default: "" },
    logoPath: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
    actionPlanText: { type: String, default: DEFAULT_ACTION_PLAN_TEXT },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
