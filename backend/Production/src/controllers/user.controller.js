"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
exports.completeProfile = completeProfile;
exports.completeOnboarding = completeOnboarding;
const zod_1 = require("zod");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const User_js_1 = require("../models/User.js");
async function getMe(req, res) {
    if (!req.user)
        return res.status(401).json((0, apiResponse_js_1.fail)("NO_AUTH", "Not authenticated"));
    const user = await User_js_1.User.findById(req.user.id);
    if (!user)
        return res.status(404).json((0, apiResponse_js_1.fail)("USER_NOT_FOUND", "User not found"));
    const userData = user.toObject();
    return res.json((0, apiResponse_js_1.ok)({
        id: String(user._id),
        phone: userData.phone,
        email: userData.email,
        role: userData.role,
        profileComplete: userData.profileComplete,
        onboardingComplete: userData.onboardingComplete,
        profile: userData.profile,
        totalXP: userData.totalXP,
        level: userData.level,
        streakCount: userData.streakCount,
        wallet: userData.wallet
    }));
}
const ProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    standard: zod_1.z.literal("CBSE_STD_8"),
    timezone: zod_1.z.string().min(2)
});
async function completeProfile(req, res) {
    if (!req.user)
        return res.status(401).json((0, apiResponse_js_1.fail)("NO_AUTH", "Not authenticated"));
    const parsed = ProfileSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json((0, apiResponse_js_1.fail)("VALIDATION", "Invalid profile data", parsed.error.flatten()));
    const user = await User_js_1.User.findById(req.user.id);
    if (!user)
        return res.status(404).json((0, apiResponse_js_1.fail)("USER_NOT_FOUND", "User not found"));
    user.profile = parsed.data;
    user.profileComplete = true;
    await user.save();
    return res.json((0, apiResponse_js_1.ok)({ profileComplete: true }));
}
const OnboardingSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(80),
    school: zod_1.z.string().min(2).max(120).optional(),
    age: zod_1.z.number().int().min(5).max(25).optional(),
    standard: zod_1.z.string().min(2),
    timezone: zod_1.z.string().min(2).default("Asia/Kolkata")
});
async function completeOnboarding(req, res) {
    if (!req.user)
        return res.status(401).json((0, apiResponse_js_1.fail)("NO_AUTH", "Not authenticated"));
    const parsed = OnboardingSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json((0, apiResponse_js_1.fail)("VALIDATION", "Invalid onboarding data", parsed.error.flatten()));
    const user = await User_js_1.User.findById(req.user.id);
    if (!user)
        return res.status(404).json((0, apiResponse_js_1.fail)("USER_NOT_FOUND", "User not found"));
    const { fullName, school, age, standard, timezone } = parsed.data;
    user.profile = {
        ...(user.profile || {}),
        fullName,
        school: school ?? undefined,
        age: age ?? undefined,
        standard,
        timezone
    };
    user.profileComplete = true;
    user.onboardingComplete = true;
    await user.save();
    return res.json((0, apiResponse_js_1.ok)({
        onboardingComplete: true,
        profileComplete: true,
        profile: user.toObject().profile
    }));
}