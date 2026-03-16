"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const WalletTransactionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["earn", "spend"], required: true },
    currency: { type: String, enum: ["coins", "diamonds"], required: true },
    amount: { type: Number, required: true },
    reason: { type: String }
}, { timestamps: true });
exports.WalletTransaction = mongoose_1.default.model("WalletTransaction", WalletTransactionSchema);