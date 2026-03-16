"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeWeeklyLeaderboardJob = recomputeWeeklyLeaderboardJob;
const UserWeeklyStats_1 = require("../../models/UserWeeklyStats");
async function recomputeWeeklyLeaderboardJob(_job) {
    await UserWeeklyStats_1.UserWeeklyStats.countDocuments();
}