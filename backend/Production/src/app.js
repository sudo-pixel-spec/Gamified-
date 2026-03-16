"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const pino_http_1 = __importDefault(require("pino-http"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = require("./config/cors");
const requestId_1 = require("./middleware/requestId");
const health_routes_1 = require("./routes/health.routes");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const curriculum_routes_1 = require("./routes/curriculum.routes");
const attempt_routes_1 = require("./routes/attempt.routes");
const leaderboard_routes_1 = require("./routes/leaderboard.routes");
const chat_routes_1 = require("./routes/chat.routes");
const admin_routes_1 = require("./routes/admin.routes");
const dashboard_routes_1 = require("./routes/dashboard.routes");
const startJobs_1 = require("./jobs/startJobs");
const notFound_1 = require("./middleware/notFound");
const error_1 = require("./middleware/error");
const env_1 = require("./config/env");
function createApp() {
    const app = (0, express_1.default)();
    app.set("trust proxy", 1);
    if (env_1.env.NODE_ENV !== "test") {
        (0, startJobs_1.startJobsIfEnabled)().catch((e) => {
            console.error("Jobs start failed", e);
        });
    }
    app.use(requestId_1.requestId);
    if (env_1.env.NODE_ENV !== "test") {
        app.use((0, pino_http_1.default)({
            autoLogging: {
                ignore: (req) => req.url === "/v1/health",
            },
        }));
    }
    app.use((0, helmet_1.default)());
    app.use(cors_1.corsMiddleware);
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use("/v1", health_routes_1.healthRouter);
    app.use("/v1", auth_routes_1.authRouter);
    app.use("/v1", user_routes_1.userRouter);
    app.use("/v1", curriculum_routes_1.curriculumRouter);
    app.use("/v1", attempt_routes_1.attemptRouter);
    app.use("/v1", leaderboard_routes_1.leaderboardRouter);
    app.use("/v1", chat_routes_1.chatRouter);
    app.use("/v1/admin", admin_routes_1.adminRouter);
    app.use("/v1", dashboard_routes_1.dashboardRouter);
    app.use(notFound_1.notFound);
    app.use(error_1.errorHandler);
    return app;
}