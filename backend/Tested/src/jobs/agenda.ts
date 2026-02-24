let agenda: any = null;

export async function createAgenda(mongoUri: string) {
  const mod: any = await import("agenda");
  const AgendaCtor = mod?.default ?? mod;

  const collection = process.env.JOBS_COLLECTION || "jobs";
  const lockLifetime = Number(process.env.JOBS_LOCK_LIFETIME_MS ?? 10 * 60 * 1000);

  agenda = new AgendaCtor({
    db: { address: mongoUri, collection },
    processEvery: "5 seconds",
    defaultLockLifetime: lockLifetime
  });

  const concurrency = Number(process.env.JOBS_CONCURRENCY ?? 5);
  agenda.defaultConcurrency(concurrency);
  agenda.lockLimit(concurrency);

  return agenda;
}

export function getAgenda() {
  if (!agenda) throw new Error("Agenda not initialized. Call createAgenda() first.");
  return agenda;
}
