export declare function createOtp(phone: string, ip?: string): Promise<string>;
export declare function verifyOtp(phone: string, otp: string): Promise<{
    ok: false;
    reason: string;
    attemptsLeft?: never;
} | {
    ok: false;
    reason: string;
    attemptsLeft: number;
} | {
    ok: true;
    reason?: never;
    attemptsLeft?: never;
}>;