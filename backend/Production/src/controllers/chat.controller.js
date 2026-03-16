"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = chat;
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
const ChatSession_1 = require("../models/ChatSession");
const ChatMessage_1 = require("../models/ChatMessage");
const Lesson_1 = require("../models/Lesson");
const Attempt_1 = require("../models/Attempt");
const ai_service_1 = require("../services/ai.service");
const UserDailyUsage_1 = require("../models/UserDailyUsage");
const ChatSchema = zod_1.z.object({
    message: zod_1.z.string().min(2),
    sessionId: zod_1.z.string().optional(),
    lessonId: zod_1.z.string().optional(),
});
function detectCheating(message) {
    const lower = message.toLowerCase();
    return (lower.includes("give me answers") ||
        lower.includes("just tell me option") ||
        lower.includes("without explanation") ||
        lower.includes("answer key") ||
        lower.includes("give me the answers"));
}
async function chat(req, res) {
    if (!req.user)
        return res.status(401).json((0, apiResponse_1.fail)("NO_AUTH", "Not authenticated"));
    const parsed = ChatSchema.safeParse(req.body);
    if (!parsed.success) {
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    }
    const limit = Number(process.env.AI_DAILY_LIMIT ?? 50);
    const today = new Date().toISOString().slice(0, 10);
    const usage = await UserDailyUsage_1.UserDailyUsage.findOneAndUpdate({ userId: req.user.id, date: today }, {
        $setOnInsert: { userId: req.user.id, date: today },
        $inc: { aiMessages: 1 },
    }, { new: true, upsert: true }).lean();
    const requestId = req.requestId;
    if ((usage?.aiMessages ?? 0) > limit) {
        return res
            .status(429)
            .json((0, apiResponse_1.fail)("AI_DAILY_LIMIT", "Daily AI limit reached"));
    }
    const { message, sessionId, lessonId } = parsed.data;
    if (message.length > 2000) {
        return res
            .status(400)
            .json((0, apiResponse_1.fail)("MESSAGE_TOO_LONG", "Message exceeds allowed length"));
    }
    if (detectCheating(message)) {
        return res.json((0, apiResponse_1.ok)({
            reply: "I can help explain concepts, but I won't provide direct quiz answers.",
        }));
    }
    let session = null;
    if (sessionId) {
        session = await ChatSession_1.ChatSession.findById(sessionId);
        if (session && String(session.userId) !== String(req.user.id)) {
            return res.status(403).json((0, apiResponse_1.fail)("FORBIDDEN", "Invalid session"));
        }
    }
    if (!session) {
        const sessionPayload = {
            userId: req.user.id,
            title: message.slice(0, 50),
        };
        if (lessonId)
            sessionPayload.lessonId = String(lessonId);
        session = await ChatSession_1.ChatSession.create(sessionPayload);
    }
    let lessonContext = "";
    if (lessonId) {
        const lesson = await Lesson_1.Lesson.findById(lessonId).lean();
        if (lesson) {
            lessonContext = `Lesson context:\nTitle: ${lesson.title}\n\n${lesson.contentText ?? ""}`;
        }
    }
    let weaknessContext = "";
    try {
        const weakAttempts = await Attempt_1.Attempt.find({
            userId: req.user.id,
            totalQuestions: { $gt: 0 },
            score: { $ne: null },
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        const weak = weakAttempts
            .filter((a) => (a.totalQuestions ?? 0) > 0 &&
            (a.score ?? 0) / (a.totalQuestions ?? 1) < 0.5)
            .slice(0, 3);
        if (weak.length) {
            const lessonIds = weak.map((a) => a.lessonId);
            const lessons = await Lesson_1.Lesson.find({ _id: { $in: lessonIds } })
                .select({ title: 1 })
                .lean();
            const titles = lessons.map((l) => `- ${l.title}`).join("\n");
            weaknessContext = `\nStudent seems to struggle with these recent topics:\n${titles}\nFocus on clarity and step-by-step explanation.\n`;
        }
    }
    catch {
    }
    const systemPrompt = `
You are a CBSE Std 8 learning assistant.
Stay within CBSE Std 8 syllabus and the provided lesson context.
If the user asks outside syllabus, politely refuse and guide them back to relevant concepts.
Do not provide direct quiz/answer keys. Teach concepts and reasoning.
Be clear, step-by-step, and encourage understanding.
${weaknessContext}
`.trim();
    const history = await ChatMessage_1.ChatMessage.find({ sessionId: session._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    const reversedHistory = history
        .reverse()
        .map((m) => ({ role: m.role, content: m.content }));
    const messages = [
        {
            role: "system",
            content: systemPrompt + (lessonContext ? `\n\n${lessonContext}` : ""),
        },
        ...reversedHistory,
        { role: "user", content: message },
    ];
    const ai = await ai_service_1.aiProvider.chat(messages);
    const msgsToCreate = [
        { sessionId: session._id, role: "user", content: message },
        { sessionId: session._id, role: "assistant", content: ai.content }
    ];
    if (ai.tokenCount != null) {
        msgsToCreate[1].tokenCount = ai.tokenCount;
    }
    await ChatMessage_1.ChatMessage.create(msgsToCreate);
    return res.json((0, apiResponse_1.ok)({ reply: ai.content, sessionId: session._id }));
}