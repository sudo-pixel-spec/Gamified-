import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true, index: true },
  title: { type: String, required: true },
  orderIndex: { type: Number, default: 0 },

  videoUrl: { type: String },
  bullets: [{ type: String }],
  contentText: { type: String }
});

export const Lesson = mongoose.model("Lesson", LessonSchema);
