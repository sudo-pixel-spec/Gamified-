"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOtp = requestOtp;
exports.verifyOtp = verifyOtp;
exports.googleSignIn = googleSignIn;
exports.refresh = refresh;
exports.logout = logout;
const google_auth_library_1 = require("google-auth-library");
const zod_1 = require("zod");
const apiResponse_1 = require("../utils/apiResponse");
const otpService_1 = require("../services/otpService");
const User_1 = require("../models/User");
const RefreshToken_1 = require("../models/RefreshToken");
const authTokens_1 = require("../services/authTokens");
const env_1 = require("../config/env");
function normalizeIndianPhone(raw) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 10)
        return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91"))
        return `+${digits}`;
    return raw.trim();
}
const RequestOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().transform(normalizeIndianPhone).pipe(zod_1.z.string().min(10))
});
const VerifyOtpSchema = zod_1.z.object({
    phone: zod_1.z.string().transform(normalizeIndianPhone).pipe(zod_1.z.string().min(10)),
    otp: zod_1.z.string().min(6).max(6)
});
const GoogleSchema = zod_1.z.object({
    credential: zod_1.z.string().min(20)
});
function setRefreshCookie(res, refreshToken) {
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: env_1.env.COOKIE_SECURE,
        path: "/v1/auth",
        maxAge: env_1.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
    });
}
async function requestOtp(req, res) {
    const parsed = RequestOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid phone number", parsed.error.flatten()));
    }
    const { phone } = parsed.data;
    const otp = await (0, otpService_1.createOtp)(phone, req.ip);
    console.log(`\n============================`);
    console.log(`📱 MOCK SMS SERVICE`);
    console.log(`To: ${phone}`);
    console.log(`Message: Your Gamifyed OTP is ${otp}. Valid for 5 minutes.`);
    console.log(`============================\n`);
    return res.json((0, apiResponse_1.ok)({ message: "OTP sent successfully" }));
}
async function verifyOtp(req, res) {
    const parsed = VerifyOtpSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    }
    const { phone, otp } = parsed.data;
    const result = await (0, otpService_1.verifyOtp)(phone, otp);
    if (!result.ok) {
        return res.status(401).json((0, apiResponse_1.fail)(result.reason, "OTP verification failed", result));
    }
    let user = await User_1.User.findOne({ phone });
    if (!user)
        user = await User_1.User.create({ phone, role: "learner" });
    const accessToken = (0, authTokens_1.signAccessToken)({ sub: String(user._id), role: user.role });
    const refreshToken = (0, authTokens_1.signRefreshToken)({ sub: String(user._id), role: user.role });
    const tokenHash = await (0, authTokens_1.hashToken)(refreshToken);
    const deviceId = req.headers["x-device-id"] || req.body.deviceId || "unknown";
    await RefreshToken_1.RefreshToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + env_1.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
        createdIp: req.ip || null,
        userAgent: req.get("user-agent") || null,
        deviceId: String(deviceId)
    });
    setRefreshCookie(res, refreshToken);
    return res.json((0, apiResponse_1.ok)({
        accessToken,
        user: {
            id: String(user._id),
            phone: user.phone,
            role: user.role,
            profileComplete: user.profileComplete,
            onboardingComplete: user.onboardingComplete
        }
    }));
}
async function googleSignIn(req, res) {
    const parsed = GoogleSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json((0, apiResponse_1.fail)("VALIDATION", "Invalid payload", parsed.error.flatten()));
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
        return res.status(500).json((0, apiResponse_1.fail)("CONFIG", "GOOGLE_CLIENT_ID missing"));
    }
    const { credential } = parsed.data;
    const googleClient = new google_auth_library_1.OAuth2Client(googleClientId);
    let ticket;
    try {
        ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleClientId
        });
    }
    catch {
        return res.status(401).json((0, apiResponse_1.fail)("GOOGLE_AUTH_FAILED", "Invalid Google credential"));
    }
    const payload = ticket.getPayload();
    const email = payload?.email;
    const emailVerified = payload?.email_verified;
    const name = payload?.name ?? "";
    const picture = payload?.picture ?? "";
    const sub = payload?.sub ?? "";
    if (!email || emailVerified !== true) {
        return res.status(401).json((0, apiResponse_1.fail)("GOOGLE_AUTH_FAILED", "Google account email not verified"));
    }
    let user = await User_1.User.findOne({ email });
    if (!user) {
        user = await User_1.User.create({
            email,
            role: "learner",
            authProvider: "google",
            googleSub: sub || undefined,
            profile: {
                fullName: name,
                avatarUrl: picture
            },
            profileComplete: false
        });
    }
    else {
        const updates = {};
        if (!user.authProvider)
            updates.authProvider = "google";
        if (!user.googleSub && sub)
            updates.googleSub = sub;
        if (picture && !user.profile?.avatarUrl)
            updates["profile.avatarUrl"] = picture;
        if (name && !user.profile?.fullName)
            updates["profile.fullName"] = name;
        if (Object.keys(updates).length) {
            await User_1.User.updateOne({ _id: user._id }, { $set: updates });
            user = await User_1.User.findById(user._id);
        }
    }
    const accessToken = (0, authTokens_1.signAccessToken)({ sub: String(user._id), role: user.role });
    const refreshToken = (0, authTokens_1.signRefreshToken)({ sub: String(user._id), role: user.role });
    const tokenHash = await (0, authTokens_1.hashToken)(refreshToken);
    const deviceId = req.headers["x-device-id"] || req.body.deviceId || "unknown";
    await RefreshToken_1.RefreshToken.create({
        userId: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + env_1.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
        createdIp: req.ip || null,
        userAgent: req.get("user-agent") || null,
        deviceId: String(deviceId)
    });
    setRefreshCookie(res, refreshToken);
    return res.json((0, apiResponse_1.ok)({
        accessToken,
        user: {
            id: String(user._id),
            email: user.email,
            role: user.role,
            profileComplete: user.profileComplete,
            onboardingComplete: user.onboardingComplete || false
        }
    }));
}
async function refresh(req, res) {
    const token = req.cookies?.refresh_token;
    if (!token)
        return res.status(401).json((0, apiResponse_1.fail)("NO_REFRESH", "Missing refresh token"));
    let decoded;
    try {
        decoded = (0, authTokens_1.verifyToken)(token);
    }
    catch {
        return res.status(401).json((0, apiResponse_1.fail)("INVALID_REFRESH", "Invalid refresh token"));
    }
    const sessions = await RefreshToken_1.RefreshToken.find({ userId: decoded.sub, revokedAt: null });
    const matching = await (async () => {
        for (const s of sessions) {
            const okMatch = await (0, authTokens_1.compareToken)(token, s.tokenHash);
            if (okMatch)
                return s;
        }
        return null;
    })();
    if (!matching) {
        await RefreshToken_1.RefreshToken.updateMany({ userId: decoded.sub }, { revokedAt: new Date() });
        return res.status(401).json((0, apiResponse_1.fail)("REFRESH_REUSE", "Refresh token reuse detected"));
    }
    matching.revokedAt = new Date();
    await matching.save();
    const newRefresh = (0, authTokens_1.signRefreshToken)({ sub: decoded.sub, role: decoded.role });
    const newHash = await (0, authTokens_1.hashToken)(newRefresh);
    await RefreshToken_1.RefreshToken.create({
        userId: decoded.sub,
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + env_1.env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
        createdIp: req.ip || null,
        userAgent: req.get("user-agent") || null
    });
    setRefreshCookie(res, newRefresh);
    const accessToken = (0, authTokens_1.signAccessToken)({ sub: decoded.sub, role: decoded.role });
    return res.json((0, apiResponse_1.ok)({ accessToken }));
}
async function logout(req, res) {
    const token = req.cookies?.refresh_token;
    if (token) {
        const sessions = await RefreshToken_1.RefreshToken.find({ revokedAt: null });
        for (const s of sessions) {
            const okMatch = await (0, authTokens_1.compareToken)(token, s.tokenHash);
            if (okMatch) {
                s.revokedAt = new Date();
                await s.save();
                break;
            }
        }
    }
    res.clearCookie("refresh_token", { path: "/v1/auth" });
    return res.json((0, apiResponse_1.ok)({ message: "Logged out" }));
}