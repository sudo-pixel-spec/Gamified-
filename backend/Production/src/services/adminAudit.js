"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAdminAudit = writeAdminAudit;
const AdminAuditLog_1 = require("../models/AdminAuditLog");
async function writeAdminAudit(req, params) {
    const adminId = req.user?.id;
    if (!adminId)
        return;
    await AdminAuditLog_1.AdminAuditLog.create({
        adminId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        payload: params.payload,
        requestId: req.requestId,
        ip: req.ip,
        userAgent: req.get?.("user-agent")
    });
}