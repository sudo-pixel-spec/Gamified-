"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserWeeklyStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserWeeklyStatsSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weekStart: { type: String, required: true, index: true },
    lessonsCompleted: { type: Number, default: 0 },
    questionsAttempted: { type: Number, default: 0 },
    questionsCorrect: { type: Number, default: 0 },
    hardPerfectCount: { type: Number, default: 0 },
    eligibleXP: { type: Number, default: 0 },
    activeDays: { type: Number, default: 0 },
    lastActiveDay: { type: String, default: null },
    dailyCapUsed: { type: Number, default: 0 },
    suspiciousFlags: [{ type: String }]
}, { timestamps: true });
UserWeeklyStatsSchema.index({ userId: 1, weekStart: 1 }, { unique: true });
UserWeeklyStatsSchema.index({ weekStart: 1, eligibleXP: -1 });
exports.UserWeeklyStats = mongoose_1.default.model("UserWeeklyStats", UserWeeklyStatsSchema);