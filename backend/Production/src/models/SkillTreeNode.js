"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillTreeNode = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const SkillTreeNodeSchema = new mongoose_1.default.Schema({
    lessonId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    standardId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Standard", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    orderIndex: { type: Number, default: 0 },
    xpReward: { type: Number, default: 50 },
    type: { type: String, enum: ["lesson", "quiz", "challenge", "milestone"], default: "lesson" },
    iconEmoji: { type: String, default: "📘" },
    published: { type: Boolean, default: true }
}, { timestamps: true });
exports.SkillTreeNode = mongoose_1.default.model("SkillTreeNode", SkillTreeNodeSchema);