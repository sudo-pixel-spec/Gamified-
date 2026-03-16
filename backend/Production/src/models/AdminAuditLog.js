"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAuditLog = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AdminAuditLogSchema = new mongoose_1.default.Schema({
    adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    requestId: { type: String },
    ip: { type: String },
    userAgent: { type: String },
    payload: { type: Object }
}, { timestamps: true });
AdminAuditLogSchema.index({ createdAt: -1 });
exports.AdminAuditLog = mongoose_1.default.model("AdminAuditLog", AdminAuditLogSchema);