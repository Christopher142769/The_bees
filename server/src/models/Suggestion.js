import mongoose from "mongoose";

const suggestionSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    content: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    isAnonymous: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Suggestion", suggestionSchema);
