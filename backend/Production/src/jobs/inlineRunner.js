"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runJobInline = runJobInline;
const emailProvider_1 = require("../services/emailProvider");
const recomputeWeeklyLeaderboard_1 = require("./tasks/recomputeWeeklyLeaderboard");
const writeAiLog_1 = require("./tasks/writeAiLog");
async function runJobInline(name, payload) {
    switch (name) {
        case "sendOtpEmail": {
            const { email, otp } = payload;
            const emailProvider = (0, emailProvider_1.getEmailProvider)();
            await emailProvider.sendOtp(email, otp);
            return;
        }
        case "recomputeWeeklyLeaderboard": {
            await (0, recomputeWeeklyLeaderboard_1.recomputeWeeklyLeaderboard)(payload);
            return;
        }
        case "aiLog": {
            await (0, writeAiLog_1.writeAiLog)(payload);
            return;
        }
        default:
            throw new Error(`Unknown job: ${name}`);
    }
}