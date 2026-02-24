import { env } from "./config/env";
import { connectDB } from "./config/db";
import { createApp } from "./app";

import { createAgenda } from "./jobs/agenda";
import { defineJobs, JOBS } from "./jobs/definitions";

async function main() {
  await connectDB();

  const app = createApp();

  if (process.env.JOBS_ENABLED === "true") {
    const mongoUri = env.MONGO_URI;

    const agenda = await createAgenda(mongoUri);
    defineJobs(agenda);

    await agenda.start();

    await agenda.every(
      "5 minutes",
      JOBS.RECOMPUTE_WEEKLY_LEADERBOARD
    );

    const shutdown = async () => {
      console.log("Stopping agenda...");
      await agenda.stop();
      process.exit(0);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  }

  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
