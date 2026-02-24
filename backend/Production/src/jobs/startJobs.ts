import { env } from "../config/env";

/**
 * Starts background job processing if enabled.
 *
 * - In tests: does nothing (never imports agenda).
 * - In prod/dev:
 *   - JOBS_DRIVER=inline -> no worker to start (jobs run inline on enqueue)
 *   - JOBS_DRIVER=agenda -> start agenda processor in this process
 *
 * If later you want a separate worker process, you can create a worker entrypoint
 * that imports getAgenda() + defineJobs() + agenda.start().
 */
export async function startJobsIfEnabled() {
  if (env.NODE_ENV === "test") return;

  if (!env.JOBS_ENABLED) return;

  if (env.JOBS_DRIVER === "inline") return;

  const { getAgenda } = await import("./agendaDriver");
  const { defineJobs } = await import("./definitions");

  const agenda = await getAgenda();
  defineJobs(agenda);
  await agenda.start();

  console.log("[jobs] agenda started");
}