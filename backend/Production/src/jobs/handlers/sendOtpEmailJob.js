"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmailJob = sendOtpEmailJob;
const emailProvider_1 = require("../../services/emailProvider");
async function sendOtpEmailJob(job) {
    const { email, otp } = job.attrs.data;
    if (!email || !otp) {
        throw new Error("Missing email/otp");
    }
    await emailProvider_1.emailProvider.sendOtp(email, otp);
}