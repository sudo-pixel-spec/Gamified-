"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAgendaJobs = defineAgendaJobs;
const inlineRunner_1 = require("./inlineRunner");
function defineAgendaJobs(agenda) {
    agenda.define("sendOtpEmail", async (job) => {
        await (0, inlineRunner_1.runJobInline)("sendOtpEmail", job.attrs.data);
    });
    agenda.define("recomputeWeeklyLeaderboard", async (job) => {
        await (0, inlineRunner_1.runJobInline)("recomputeWeeklyLeaderboard", job.attrs.data);
    });
    agenda.define("aiLog", async (job) => {
        await (0, inlineRunner_1.runJobInline)("aiLog", job.attrs.data);
    });
}