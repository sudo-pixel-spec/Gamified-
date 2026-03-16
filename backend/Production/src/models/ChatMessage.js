"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ChatMessageSchema = new mongoose_1.default.Schema({
    sessionId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "ChatSession", required: true, index: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    tokenCount: { type: Number }
}, { timestamps: true });
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });
exports.ChatMessage = mongoose_1.default.model("ChatMessage", ChatMessageSchema);