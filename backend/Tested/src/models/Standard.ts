import mongoose from "mongoose";

const StandardSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  active: { type: Boolean, default: false }
});

export const Standard = mongoose.model("Standard", StandardSchema);
