"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = requestId;
const node_crypto_1 = __importDefault(require("node:crypto"));
function requestId(req, res, next) {
    const incoming = req.header("x-request-id");
    const id = (incoming && String(incoming).trim()) || node_crypto_1.default.randomUUID();
    req.requestId = id;
    res.setHeader("x-request-id", id);
    next();
}