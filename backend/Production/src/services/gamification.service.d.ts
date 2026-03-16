export declare function calculateXP(score: number, total: number, difficulty: string): number;
export declare function calculateLevel(totalXP: number): number;
export declare function calculateCoins(score: number, total: number): 20 | 10;
export declare function calculateDiamonds(score: number, total: number, difficulty: string): 5 | 0;
export declare function updateStreak(lastActiveDate: string | null): {
    newStreak: number;
    today: string;
    increment?: never;
    reset?: never;
} | {
    newStreak: null;
    today: string;
    increment?: never;
    reset?: never;
} | {
    increment: boolean;
    today: string;
    newStreak?: never;
    reset?: never;
} | {
    reset: boolean;
    today: string;
    newStreak?: never;
    increment?: never;
};