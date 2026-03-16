"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeWeeklyLeaderboard = recomputeWeeklyLeaderboard;
const recomputeWeeklyLeaderboardJob_1 = require("../handlers/recomputeWeeklyLeaderboardJob");
async function recomputeWeeklyLeaderboard(payload) {
    const fakeJob = { attrs: { data: payload } };
    await (0, recomputeWeeklyLeaderboardJob_1.recomputeWeeklyLeaderboardJob)(fakeJob);
}