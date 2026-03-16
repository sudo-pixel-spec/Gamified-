"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weeklyGrowth = weeklyGrowth;
exports.mastery = mastery;
const apiResponse_1 = require("../utils/apiResponse");
const leaderboard_service_1 = require("../services/leaderboard.service");
async function weeklyGrowth(req, res) {
    const weekStart = typeof req.query.weekStart === "string" ? req.query.weekStart : (0, leaderboard_service_1.getWeekStartISO)(new Date());
    const data = await (0, leaderboard_service_1.getWeeklyLeaderboard)(weekStart, "growth", 50);
    return res.json((0, apiResponse_1.ok)({ weekStart, type: "growth", entries: data }));
}
async function mastery(req, res) {
    const weekStart = typeof req.query.weekStart === "string" ? req.query.weekStart : (0, leaderboard_service_1.getWeekStartISO)(new Date());
    const data = await (0, leaderboard_service_1.getWeeklyLeaderboard)(weekStart, "mastery", 50);
    return res.json((0, apiResponse_1.ok)({ weekStart, type: "mastery", entries: data }));
}