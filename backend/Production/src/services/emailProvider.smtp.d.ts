export declare class SmtpEmailProvider {
    private transporter;
    constructor();
    sendOtp(email: string, otp: string): Promise<void>;
}