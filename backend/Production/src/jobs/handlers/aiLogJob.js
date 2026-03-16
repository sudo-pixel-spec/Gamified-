"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiLogJob = aiLogJob;
const ChatMessage_1 = require("../../models/ChatMessage");
async function aiLogJob(job) {
    const { sessionId, userMsg, assistantMsg, requestId } = job.attrs.data;
    if (!sessionId)
        throw new Error("Missing sessionId");
    await ChatMessage_1.ChatMessage.create([
        { sessionId: String(sessionId), role: "user", content: String(userMsg) },
        { sessionId: String(sessionId), role: "assistant", content: String(assistantMsg) }
    ]);
}