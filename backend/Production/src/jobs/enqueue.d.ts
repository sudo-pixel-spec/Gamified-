type JobName = "sendOtpEmail" | "recomputeWeeklyLeaderboard" | "aiLog";
export type EnqueueOptions = {
    runAt?: Date;
};
export declare function enqueueNow(name: JobName, payload: any): Promise<any>;
export declare function enqueueAt(name: JobName, payload: any, runAt: Date): Promise<any>;
export {};