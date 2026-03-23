import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    publicId: { type: String, default: "" },
    originalName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
