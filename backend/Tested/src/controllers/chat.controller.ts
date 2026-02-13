import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";
import { ok, fail } from "../utils/apiResponse";
import { ChatSession } from "../models/ChatSession";
import { ChatMessage } from "../models/ChatMessage";
import { Lesson } from "../models/Lesson";
import { aiProvider } from "../services/ai.service";

const ChatSchema = z.object({
  message: z.string().min(2),
  sessionId: z.string().optional(),
  lessonId: z.string().optional()
});

function detectCheating(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes("give me answers") ||
    lower.includes("just tell me option") ||
    lower.includes("without explanation")
  );
}

export async function chat(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json(fail("NO_AUTH", "Not authenticated"));

  const parsed = ChatSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const { message, sessionId, lessonId } = parsed.data;

  if (detectCheating(message)) {
    return res.json(ok({ reply: "I can help explain concepts, but I won't provide direct quiz answers." }));
  }

  let session = null;

  if (sessionId) {
    session = await ChatSession.findById(sessionId);
  }

  if (!session) {
    session = await ChatSession.create({
      userId: req.user.id,
      lessonId,
      title: message.slice(0, 50)
    });
  }

  let lessonContext = "";
  if (lessonId) {
    const lesson = await Lesson.findById(lessonId).lean();
    if (lesson) {
      lessonContext = `Lesson context:\n${lesson.title}\n${lesson.contentText ?? ""}`;
    }
  }

  const systemPrompt = `
You are a CBSE Std 8 learning assistant.
Only answer within syllabus.
If asked outside syllabus, politely refuse.
Encourage understanding.
`;

  const messages = [
    { role: "system", content: systemPrompt + "\n" + lessonContext },
    { role: "user", content: message }
  ];

  const ai = await aiProvider.chat(messages);

  await ChatMessage.create([
    { sessionId: session._id, role: "user", content: message },
    { sessionId: session._id, role: "assistant", content: ai.content }
  ]);

  return res.json(ok({ reply: ai.content, sessionId: session._id }));
}
