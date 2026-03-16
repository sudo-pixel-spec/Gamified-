"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.get("/dashboard/home", auth_1.requireAuth, dashboard_controller_1.getDashboardHome);