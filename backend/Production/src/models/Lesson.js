"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lesson = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const LessonSchema = new mongoose_1.default.Schema({
    chapterId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Chapter", required: true, index: true },
    title: { type: String, required: true },
    orderIndex: { type: Number, default: 0 },
    videoUrl: { type: String },
    bullets: [{ type: String }],
    contentText: { type: String },
    published: { type: Boolean, default: false },
    tags: [{ type: String }],
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", default: null },
});
exports.Lesson = mongoose_1.default.model("Lesson", LessonSchema);