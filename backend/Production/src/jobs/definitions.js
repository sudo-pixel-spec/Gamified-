"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOBS = void 0;
exports.defineJobs = defineJobs;
const sendOtpEmailJob_1 = require("./handlers/sendOtpEmailJob");
const recomputeWeeklyLeaderboardJob_1 = require("./handlers/recomputeWeeklyLeaderboardJob");
const aiLogJob_1 = require("./handlers/aiLogJob");
exports.JOBS = {
    SEND_OTP_EMAIL: "sendOtpEmail",
    RECOMPUTE_WEEKLY_LEADERBOARD: "recomputeWeeklyLeaderboard",
    AI_LOG: "aiLog"
};
function defineJobs(agenda) {
    agenda.define(exports.JOBS.SEND_OTP_EMAIL, { priority: "high", concurrency: 10 }, sendOtpEmailJob_1.sendOtpEmailJob);
    agenda.define(exports.JOBS.AI_LOG, { priority: "low", concurrency: 5 }, aiLogJob_1.aiLogJob);
    agenda.define(exports.JOBS.RECOMPUTE_WEEKLY_LEADERBOARD, { priority: "normal", concurrency: 1 }, recomputeWeeklyLeaderboardJob_1.recomputeWeeklyLeaderboardJob);
}