"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attemptRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const attempt_controller_1 = require("../controllers/attempt.controller");
exports.attemptRouter = (0, express_1.Router)();
exports.attemptRouter.post("/attempts/submit", auth_1.requireAuth, auth_1.profileGate, attempt_controller_1.submitAttempt);