import { sendOtpEmailJob } from "./handlers/sendOtpEmailJob";
import { recomputeWeeklyLeaderboardJob } from "./handlers/recomputeWeeklyLeaderboardJob";
import { aiLogJob } from "./handlers/aiLogJob";

export const JOBS = {
  SEND_OTP_EMAIL: "SEND_OTP_EMAIL",
  RECOMPUTE_WEEKLY_LEADERBOARD: "RECOMPUTE_WEEKLY_LEADERBOARD",
  AI_LOG: "AI_LOG"
} as const;

export function defineJobs(agenda: any) {
  agenda.define(JOBS.SEND_OTP_EMAIL, { priority: "high", concurrency: 10 }, sendOtpEmailJob);
  agenda.define(JOBS.AI_LOG, { priority: "low", concurrency: 5 }, aiLogJob);

  agenda.define(
    JOBS.RECOMPUTE_WEEKLY_LEADERBOARD,
    { priority: "normal", concurrency: 1 },
    recomputeWeeklyLeaderboardJob
  );
}
