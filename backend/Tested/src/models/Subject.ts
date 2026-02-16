import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  standardId: { type: mongoose.Schema.Types.ObjectId, ref: "Standard", required: true, index: true },
  name: { type: String, required: true },
  orderIndex: { type: Number, default: 0 },

  deletedAt: { type: Date, default: null, index: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
});

export const Subject = mongoose.model("Subject", SubjectSchema);
