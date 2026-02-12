import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  standardId: { type: mongoose.Schema.Types.ObjectId, ref: "Standard", required: true, index: true },
  name: { type: String, required: true },
  orderIndex: { type: Number, default: 0 }
});

export const Subject = mongoose.model("Subject", SubjectSchema);
