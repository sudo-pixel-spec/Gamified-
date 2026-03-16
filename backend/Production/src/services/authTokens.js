"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyToken = verifyToken;
exports.hashToken = hashToken;
exports.compareToken = compareToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
function signAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: `${env_1.env.ACCESS_TOKEN_TTL_MIN}m` });
}
function signRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: `${env_1.env.REFRESH_TOKEN_TTL_DAYS}d` });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
}
async function hashToken(token) {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(token, salt);
}
async function compareToken(token, tokenHash) {
    return bcryptjs_1.default.compare(token, tokenHash);
}