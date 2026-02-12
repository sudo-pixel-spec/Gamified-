import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema({
  unitId: { type: mongoose.Schema.Types.ObjectId, ref: "Unit", required: true, index: true },
  name: { type: String, required: true },
  orderIndex: { type: Number, default: 0 }
});

export const Chapter = mongoose.model("Chapter", ChapterSchema);
