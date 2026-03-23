import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    originalName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
