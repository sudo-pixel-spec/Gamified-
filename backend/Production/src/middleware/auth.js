"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.profileGate = profileGate;
const apiResponse_1 = require("../utils/apiResponse");
const authTokens_1 = require("../services/authTokens");
const User_1 = require("../models/User");
async function requireAuth(req, res, next) {
    const authHeader = req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json((0, apiResponse_1.fail)("NO_AUTH", "Missing access token"));
    }
    const token = authHeader.replace("Bearer ", "");
    try {
        const decoded = (0, authTokens_1.verifyToken)(token);
        const user = await User_1.User.findById(decoded.sub);
        if (!user) {
            return res.status(401).json((0, apiResponse_1.fail)("USER_NOT_FOUND", "Invalid user"));
        }
        req.user = { id: String(user._id), role: user.role };
        next();
    }
    catch {
        return res.status(401).json((0, apiResponse_1.fail)("INVALID_TOKEN", "Invalid or expired token"));
    }
}
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user)
            return res.status(401).json((0, apiResponse_1.fail)("NO_AUTH", "Not authenticated"));
        if (req.user.role !== role)
            return res.status(403).json((0, apiResponse_1.fail)("FORBIDDEN", "Insufficient permissions"));
        next();
    };
}
async function profileGate(req, res, next) {
    if (!req.user)
        return res.status(401).json((0, apiResponse_1.fail)("NO_AUTH", "Not authenticated"));
    const user = await User_1.User.findById(req.user.id);
    if (!user)
        return res.status(401).json((0, apiResponse_1.fail)("USER_NOT_FOUND", "Invalid user"));
    if (!user.profileComplete) {
        return res.status(403).json((0, apiResponse_1.fail)("PROFILE_INCOMPLETE", "Complete profile first"));
    }
    next();
}