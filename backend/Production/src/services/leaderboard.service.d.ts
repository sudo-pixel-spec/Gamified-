export declare function getWeekStartISO(date?: Date): string;
export declare function getDayISO(date?: Date): string;
export declare function computeWeeklyGrowthScore(s: {
    eligibleXP: number;
    questionsAttempted: number;
    questionsCorrect: number;
    activeDays: number;
    hardPerfectCount: number;
}): number;
export declare function computeMasteryScore(s: {
    lessonsCompleted: number;
    questionsAttempted: number;
    questionsCorrect: number;
    activeDays: number;
    hardPerfectCount: number;
}): number;
export declare function getWeeklyLeaderboard(weekStart: string, type: "growth" | "mastery", limit?: number): Promise<{
    userId: string;
    score: number;
    lessonsCompleted: number;
    eligibleXP: number;
    accuracy: number;
    activeDays: number;
    hardPerfectCount: number;
}[]>;