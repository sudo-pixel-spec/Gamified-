"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAndGetAccessToken = loginAndGetAccessToken;
exports.completeProfile = completeProfile;
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Otp_1 = require("../../src/models/Otp");
async function loginAndGetAccessToken(app, phone) {
    const reqRes = await (0, supertest_1.default)(app).post("/v1/auth/request-otp").send({ phone });
    if (reqRes.status !== 200) {
        throw new Error(`OTP request failed: ${reqRes.status} ${JSON.stringify(reqRes.body)}`);
    }
    const knownOtp = "123456";
    const rec = await Otp_1.Otp.findOne({ phone });
    if (!rec)
        throw new Error("OTP record missing");
    rec.otpHash = await bcryptjs_1.default.hash(knownOtp, 10);
    await rec.save();
    const res = await (0, supertest_1.default)(app).post("/v1/auth/verify-otp").send({ phone, otp: knownOtp });
    return res.body.data.accessToken;
}
async function completeProfile(app, token) {
    const res = await (0, supertest_1.default)(app)
        .patch("/v1/me/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Test User", standard: "CBSE_STD_8", timezone: "Asia/Kolkata" });
    if (res.status !== 200)
        throw new Error(`Profile completion failed: ${JSON.stringify(res.body)}`);
}