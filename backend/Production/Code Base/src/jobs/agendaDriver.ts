import mongoose from "mongoose";
import { env } from "../config/env";

let agendaInstance: any | null = null;

export async function getAgenda() {
  if (agendaInstance) return agendaInstance;

  // IMPORTANT: lazy require to avoid Jest/ESM issues
  // (agenda is ESM in some versions and breaks Jest if imported at top-level)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AgendaCtor = require("agenda").default || require("agenda");

  // Use the already-connected mongoose connection if available
  // If your app connects mongoose elsewhere before startJobsIfEnabled runs, this is ideal.
  // If not connected yet, Agenda can also use env.MONGODB_URI (we pass it below).
  const dbAddress = env.MONGODB_URI;

  agendaInstance = new AgendaCtor({
    db: { address: dbAddress, collection: env.JOBS_COLLECTION },
    maxConcurrency: env.JOBS_CONCURRENCY,
    defaultLockLifetime: env.JOBS_LOCK_LIFETIME_MS,
    processEvery: "10 seconds"
  });

  return agendaInstance;
}