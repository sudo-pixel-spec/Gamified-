export declare function verifyGoogleCredential(idToken: string): Promise<{
    sub: string;
    email: string | undefined;
    emailVerified: boolean | undefined;
    name: string | undefined;
    picture: string | undefined;
}>;