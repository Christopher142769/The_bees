import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "", trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    gender: {
      type: String,
      enum: ["femme", "homme", "autre"],
      default: "autre",
    },
    photoPath: { type: String, default: "" },
    photoPublicId: { type: String, default: "" },
    order: { type: Number, default: 0 },
    quiJeSuis: { type: String, default: "" },
    ceQuiMeMotive: { type: String, default: "" },
    mesForces: { type: String, default: "" },
    quandMeVoir: { type: String, default: "" },
    vision: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Member", memberSchema);
