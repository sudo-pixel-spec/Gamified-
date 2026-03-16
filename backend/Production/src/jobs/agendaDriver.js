"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgenda = getAgenda;
const env_1 = require("../config/env");
let agendaInstance = null;
async function getAgenda() {
    if (agendaInstance)
        return agendaInstance;
    const AgendaCtor = require("agenda").default || require("agenda");
    const dbAddress = env_1.env.MONGODB_URI;
    agendaInstance = new AgendaCtor({
        db: { address: dbAddress, collection: env_1.env.JOBS_COLLECTION },
        maxConcurrency: env_1.env.JOBS_CONCURRENCY,
        defaultLockLifetime: env_1.env.JOBS_LOCK_LIFETIME_MS,
        processEvery: "10 seconds"
    });
    return agendaInstance;
}