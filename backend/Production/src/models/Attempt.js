"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attempt = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AnswerSchema = new mongoose_1.default.Schema({
    qid: { type: String },
    selectedIndex: { type: Number },
    correct: { type: Boolean }
});
const AttemptSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lessonId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    quizVersion: { type: Number, required: true },
    answers: [AnswerSchema],
    score: { type: Number }, totalQuestions: { type: Number }, xpAwarded: { type: Number }, coinsAwarded: { type: Number }, diamondsAwarded: { type: Number },
    timeSpentSec: { type: Number },
    idempotencyKey: { type: String, index: true }
}, { timestamps: true });
AttemptSchema.index({ userId: 1, lessonId: 1, createdAt: -1 });
AttemptSchema.index({ userId: 1, createdAt: -1 });
AttemptSchema.index({ idempotencyKey: 1, userId: 1 }, { unique: true });
exports.Attempt = mongoose_1.default.model("Attempt", AttemptSchema);