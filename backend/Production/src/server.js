"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const app_1 = require("./app");
const definitions_1 = require("./jobs/definitions");
async function main() {
    await (0, db_1.connectDB)();
    const app = (0, app_1.createApp)();
    const server = app.listen(env_1.env.PORT, () => {
        console.log(`API running on http://localhost:${env_1.env.PORT}`);
    });
    let agenda = null;
    const jobsEnabled = env_1.env.NODE_ENV !== "test" && env_1.env.JOBS_ENABLED === true;
    const useAgenda = env_1.env.JOBS_DRIVER === "agenda";
    if (jobsEnabled && useAgenda) {
        const { getAgenda } = require("./jobs/agenda");
        agenda = await getAgenda();
        (0, definitions_1.defineJobs)(agenda);
        await agenda.start();
        await agenda.every("5 minutes", definitions_1.JOBS.RECOMPUTE_WEEKLY_LEADERBOARD);
    }
    const shutdown = async (signal) => {
        try {
            console.log(`Shutting down (${signal})...`);
            await new Promise((resolve) => server.close(() => resolve()));
            if (agenda) {
                console.log("Stopping agenda...");
                await agenda.stop();
            }
            await (0, db_1.disconnectDB)();
            process.exit(0);
        }
        catch (e) {
            console.error("Shutdown failed:", e);
            process.exit(1);
        }
    };
    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
}
main().catch((e) => {
    console.error("Failed to start server:", e);
    process.exit(1);
});