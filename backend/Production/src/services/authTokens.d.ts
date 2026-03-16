export declare function signAccessToken(payload: {
    sub: string;
    role: string;
}): string;
export declare function signRefreshToken(payload: {
    sub: string;
    role: string;
}): string;
export declare function verifyToken(token: string): {
    sub: string;
    role: string;
    iat: number;
    exp: number;
};
export declare function hashToken(token: string): Promise<string>;
export declare function compareToken(token: string, tokenHash: string): Promise<boolean>;