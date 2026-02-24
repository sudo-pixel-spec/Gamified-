import { JOBS } from "./definitions";
import { sendOtpEmailJob } from "./handlers/sendOtpEmailJob";
import { recomputeWeeklyLeaderboardJob } from "./handlers/recomputeWeeklyLeaderboardJob";
import { aiLogJob } from "./handlers/aiLogJob";

function shouldInlineJobs() {
  return process.env.NODE_ENV === "test" || !!process.env.JEST_WORKER_ID || process.env.DISABLE_JOBS === "true";
}

const inlineHandlers: Record<string, (job: any) => Promise<void>> = {
  [JOBS.SEND_OTP_EMAIL]: sendOtpEmailJob as any,
  [JOBS.RECOMPUTE_WEEKLY_LEADERBOARD]: recomputeWeeklyLeaderboardJob as any,
  [JOBS.AI_LOG]: aiLogJob as any
};

async function runInlineSafely(name: string, data: any) {
  const handler = inlineHandlers[name];
  if (!handler) return;

  try {
    await handler({ attrs: { data } });
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {

      console.error(`[jobs] inline job failed: ${name}`, err);
    }
  }
}

export async function enqueueNow(name: string, data: any) {
  if (shouldInlineJobs()) {
    await runInlineSafely(name, data);
    return;
  }

  const { getAgenda } = await import("./agenda");
  const agenda = await getAgenda();
  await agenda.now(name, data);
}

export async function enqueueIn(name: string, when: string | number | Date, data: any) {
  if (shouldInlineJobs()) {
    await runInlineSafely(name, data);
    return;
  }

  const { getAgenda } = await import("./agenda");
  const agenda = await getAgenda();
  await agenda.schedule(when as any, name, data);
}
