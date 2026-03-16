"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardHome = getDashboardHome;
const apiResponse_1 = require("../utils/apiResponse");
const User_1 = require("../models/User");
async function getDashboardHome(req, res) {
    if (!req.user) {
        return res.status(401).json((0, apiResponse_1.fail)("NO_AUTH", "Not authenticated"));
    }
    const user = await User_1.User.findById(req.user.id);
    if (!user) {
        return res.status(404).json((0, apiResponse_1.fail)("USER_NOT_FOUND", "User not found"));
    }
    const data = {
        profile: user.profile,
        xp: user.totalXP,
        level: user.level,
        streak: user.streakCount,
        coins: user.wallet?.coins ?? 0,
        diamonds: user.wallet?.diamonds ?? 0,
        rank: null,
        continueLearning: null,
        leaderboard: [],
        recentActivity: []
    };
    return res.json((0, apiResponse_1.ok)(data));
}