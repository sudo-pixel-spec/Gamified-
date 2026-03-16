"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDailyUsage = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserDailyUsageSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true, index: true },
    aiMessages: { type: Number, default: 0 }
}, { timestamps: true });
UserDailyUsageSchema.index({ userId: 1, date: 1 }, { unique: true });
exports.UserDailyUsage = mongoose_1.default.model("UserDailyUsage", UserDailyUsageSchema);