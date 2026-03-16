"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quiz = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const softDeletePlugin_1 = require("../models/plugins/softDeletePlugin");
const QuestionSchema = new mongoose_1.default.Schema({
    qid: { type: String, required: true },
    prompt: { type: String, required: true },
    options: [{ type: String, required: true }],
    answerIndex: { type: Number, required: true },
    explanation: { type: String }
});
const QuizSchema = new mongoose_1.default.Schema({
    lessonId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    version: { type: Number, required: true },
    source: { type: String, enum: ["seed", "ai"], default: "seed" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    published: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", default: null },
    questions: [QuestionSchema]
}, { timestamps: true });
QuizSchema.index({ lessonId: 1, version: -1 });
QuizSchema.index({ lessonId: 1, published: 1, version: -1 });
QuizSchema.plugin(softDeletePlugin_1.softDeletePlugin);
exports.Quiz = mongoose_1.default.model("Quiz", QuizSchema);