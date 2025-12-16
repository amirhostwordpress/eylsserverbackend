// SMS Service using Twilio
import twilio from "twilio";
import twilioConfig from "../config/twilio.js";

class SMSService {
    constructor() {
        if (twilioConfig.accountSid && twilioConfig.authToken) {
            this.client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
            this.phoneNumber = twilioConfig.phoneNumber;
            this.enabled = true;
        } else {
            console.warn("⚠️  Twilio credentials not configured. SMS disabled.");
            this.enabled = false;
        }
    }

    /**
     * Send SMS
     * @param {string} to - Recipient phone number
     * @param {string} message - Message body
     * @returns {Promise<object>} - Twilio response
     */
    async sendSMS(to, message) {
        if (!this.enabled) {
            console.log(`📱 SMS (disabled): To=${to}, Message=${message}`);
            return { success: false, message: "SMS service not configured" };
        }

        try {
            const result = await this.client.messages.create({
                body: message,
                from: this.phoneNumber,
                to: to,
            });

            console.log(`✅ SMS sent to ${to}: ${result.sid}`);
            return { success: true, sid: result.sid, data: result };
        } catch (error) {
            console.error("❌ SMS Error:", error);
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }

    /**
     * Send OTP
     * @param {string} to - Recipient phone number
     * @param {string} otp - OTP code
     */
    async sendOTP(to, otp) {
        const message = `Your LegalPath verification code is: ${otp}. Valid for 10 minutes.`;
        return await this.sendSMS(to, message);
    }

    /**
     * Send case notification
     */
    async sendCaseNotification(to, caseNumber, message) {
        const text = `LegalPath - Case ${caseNumber}: ${message}`;
        return await this.sendSMS(to, text);
    }
}

export default new SMSService();
