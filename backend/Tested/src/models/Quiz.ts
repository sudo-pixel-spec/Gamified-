import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
  qid: { type: String, required: true },
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  answerIndex: { type: Number, required: true },
  explanation: { type: String }
});

const QuizSchema = new mongoose.Schema(
  {
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    version: { type: Number, required: true },
    source: { type: String, enum: ["seed", "ai"], default: "seed" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    questions: [QuestionSchema]
  },
  { timestamps: true }
);

QuizSchema.index({ lessonId: 1, version: -1 });

export const Quiz = mongoose.model("Quiz", QuizSchema);
