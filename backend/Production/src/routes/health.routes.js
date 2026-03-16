"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const apiResponse_1 = require("../utils/apiResponse");
const db_1 = require("../config/db");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get("/health", (_req, res) => {
    return res.json((0, apiResponse_1.ok)({ status: "ok" }));
});
exports.healthRouter.get("/ready", (_req, res) => {
    if (!(0, db_1.isDbReady)()) {
        return res.status(503).json((0, apiResponse_1.fail)("NOT_READY", "Database not connected"));
    }
    return res.json((0, apiResponse_1.ok)({ status: "ready" }));
});