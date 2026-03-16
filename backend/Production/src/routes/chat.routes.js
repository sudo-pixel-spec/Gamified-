"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const aiRateLimit_1 = require("../middleware/aiRateLimit");
const chat_controller_1 = require("../controllers/chat.controller");
exports.chatRouter = (0, express_1.Router)();
exports.chatRouter.post("/ai/chat", auth_1.requireAuth, auth_1.profileGate, aiRateLimit_1.aiRateLimit, chat_controller_1.chat);