"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startJobsIfEnabled = startJobsIfEnabled;
const env_1 = require("../config/env");
async function startJobsIfEnabled() {
    if (env_1.env.NODE_ENV === "test")
        return;
    if (!env_1.env.JOBS_ENABLED)
        return;
    if (env_1.env.JOBS_DRIVER === "inline")
        return;
    const { getAgenda } = await import("./agendaDriver.js");
    const { defineJobs } = await import("./definitions.js");
    const agenda = await getAgenda();
    defineJobs(agenda);
    await agenda.start();
    console.log("[jobs] agenda started");
}