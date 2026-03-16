"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enqueueNow = enqueueNow;
exports.enqueueAt = enqueueAt;
const env_1 = require("../config/env");
function isTest() {
    return env_1.env.NODE_ENV === "test" || !!process.env.JEST_WORKER_ID;
}
function driver() {
    return env_1.env.JOBS_DRIVER;
}
async function inlineEnqueue(name, payload) {
    const { runJobInline } = require("./inlineRunner");
    await runJobInline(name, payload);
}
async function agendaEnqueue(name, payload, opts) {
    const { getAgenda } = require("./agendaDriver");
    const agenda = await getAgenda();
    if (opts?.runAt)
        return agenda.schedule(opts.runAt, name, payload);
    return agenda.now(name, payload);
}
async function enqueueNow(name, payload) {
    if (isTest())
        return inlineEnqueue(name, payload);
    if (env_1.env.JOBS_ENABLED && driver() === "agenda")
        return agendaEnqueue(name, payload);
    return inlineEnqueue(name, payload);
}
async function enqueueAt(name, payload, runAt) {
    if (isTest())
        return inlineEnqueue(name, payload);
    if (env_1.env.JOBS_ENABLED && driver() === "agenda")
        return agendaEnqueue(name, payload, { runAt });
    return inlineEnqueue(name, payload);
}