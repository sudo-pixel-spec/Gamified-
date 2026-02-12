export interface EmailProvider {
  sendOtp(email: string, otp: string): Promise<void>;
}

export class DevConsoleEmailProvider implements EmailProvider {
  async sendOtp(email: string, otp: string) {
    console.log(`[DEV OTP] email=${email} otp=${otp}`);
    console.log('##############################################')
    console.log('The Developer of the Backend hates his Life')
  }
}
