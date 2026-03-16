"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
const apiResponse_1 = require("../utils/apiResponse");
function requireAdmin(req, res, next) {
    if (!req.user)
        return res.status(401).json((0, apiResponse_1.fail)("NO_AUTH", "Not authenticated"));
    if (req.user.role !== "admin")
        return res.status(403).json((0, apiResponse_1.fail)("FORBIDDEN", "Admin only"));
    next();
}