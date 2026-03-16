"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOtp = createOtp;
exports.verifyOtp = verifyOtp;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Otp_js_1 = require("../models/Otp.js");
function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}
async function createOtp(phone, ip) {
    const otp = generateOtp();
    const otpHash = await bcryptjs_1.default.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await Otp_js_1.Otp.deleteMany({ phone });
    await Otp_js_1.Otp.create({ phone, otpHash, expiresAt, attemptsLeft: 5, createdIp: ip ?? null });
    return otp;
}
async function verifyOtp(phone, otp) {
    const record = await Otp_js_1.Otp.findOne({ phone });
    if (!record)
        return { ok: false, reason: "OTP_NOT_FOUND" };
    if (record.expiresAt.getTime() < Date.now()) {
        await Otp_js_1.Otp.deleteMany({ phone });
        return { ok: false, reason: "OTP_EXPIRED" };
    }
    if (record.attemptsLeft <= 0) {
        await Otp_js_1.Otp.deleteMany({ phone });
        return { ok: false, reason: "OTP_LOCKED" };
    }
    const matches = await bcryptjs_1.default.compare(otp, record.otpHash);
    if (!matches) {
        record.attemptsLeft -= 1;
        await record.save();
        return { ok: false, reason: "OTP_INVALID", attemptsLeft: record.attemptsLeft };
    }
    await Otp_js_1.Otp.deleteMany({ phone });
    return { ok: true };
}