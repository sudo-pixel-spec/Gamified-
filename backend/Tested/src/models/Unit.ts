import mongoose from "mongoose";

const UnitSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
  name: { type: String, required: true },
  orderIndex: { type: Number, default: 0 }
});

export const Unit = mongoose.model("Unit", UnitSchema);
