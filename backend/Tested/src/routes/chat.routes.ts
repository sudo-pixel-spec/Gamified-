import { Router } from "express";
import { requireAuth, profileGate } from "../middleware/auth";
import { chat } from "../controllers/chat.controller";

export const chatRouter = Router();

chatRouter.post("/ai/chat", requireAuth, profileGate, chat);
