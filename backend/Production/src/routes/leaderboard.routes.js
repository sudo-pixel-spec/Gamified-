"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
exports.leaderboardRouter = (0, express_1.Router)();
exports.leaderboardRouter.get("/leaderboards/weekly-growth", auth_1.requireAuth, auth_1.profileGate, leaderboard_controller_1.weeklyGrowth);
exports.leaderboardRouter.get("/leaderboards/mastery", auth_1.requireAuth, auth_1.profileGate, leaderboard_controller_1.mastery);