"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailProvider = exports.ResendEmailProvider = exports.SmtpEmailProvider = exports.DevConsoleEmailProvider = void 0;
exports.getEmailProvider = getEmailProvider;
const nodemailer_1 = __importDefault(require("nodemailer"));
const resend_1 = require("resend");
const env_1 = require("../config/env");
class DevConsoleEmailProvider {
    async sendOtp(email, otp) {
        console.log(`[DEV OTP] email=${email} otp=${otp}`);
    }
}
exports.DevConsoleEmailProvider = DevConsoleEmailProvider;
class SmtpEmailProvider {
    transporter = nodemailer_1.default.createTransport({
        host: env_1.env.SMTP_HOST,
        port: Number(env_1.env.SMTP_PORT || 587),
        secure: env_1.env.SMTP_SECURE,
        auth: env_1.env.SMTP_USER
            ? { user: env_1.env.SMTP_USER, pass: env_1.env.SMTP_PASS }
            : undefined
    });
    async sendOtp(email, otp) {
        const from = env_1.env.SMTP_FROM || "no-reply@example.com";
        await this.transporter.sendMail({
            from,
            to: email,
            subject: "Your login code",
            text: `Your OTP code is: ${otp}\n\nThis code expires soon.`
        });
    }
}
exports.SmtpEmailProvider = SmtpEmailProvider;
class ResendEmailProvider {
    resend = new resend_1.Resend(env_1.env.RESEND_API_KEY);
    async sendOtp(email, otp) {
        await this.resend.emails.send({
            from: env_1.env.EMAIL_FROM,
            to: email,
            subject: "Your login code",
            html: `
        <div style="font-family:Arial,sans-serif">
          <h2>Your Login Code</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing:4px">${otp}</h1>
          <p>This code expires soon.</p>
        </div>
      `
        });
    }
}
exports.ResendEmailProvider = ResendEmailProvider;
function getEmailProvider() {
    switch (env_1.env.EMAIL_PROVIDER) {
        case "smtp":
            return new SmtpEmailProvider();
        case "resend":
            return new ResendEmailProvider();
        default:
            return new DevConsoleEmailProvider();
    }
}
exports.emailProvider = getEmailProvider();