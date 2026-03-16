export interface EmailProvider {
    sendOtp(email: string, otp: string): Promise<void>;
}
export declare class DevConsoleEmailProvider implements EmailProvider {
    sendOtp(email: string, otp: string): Promise<void>;
}
export declare class SmtpEmailProvider implements EmailProvider {
    private transporter;
    sendOtp(email: string, otp: string): Promise<void>;
}
export declare class ResendEmailProvider implements EmailProvider {
    private resend;
    sendOtp(email: string, otp: string): Promise<void>;
}
export declare function getEmailProvider(): EmailProvider;
export declare const emailProvider: EmailProvider;