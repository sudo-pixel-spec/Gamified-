"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSession = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ChatSessionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lessonId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Lesson" },
    title: { type: String }
}, { timestamps: true });
exports.ChatSession = mongoose_1.default.model("ChatSession", ChatSessionSchema);