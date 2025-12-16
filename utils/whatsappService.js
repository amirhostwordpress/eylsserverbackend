// WhatsApp Service using Twilio
import twilio from "twilio";
import twilioConfig from "../config/twilio.js";

class WhatsAppService {
    constructor() {
        if (twilioConfig.accountSid && twilioConfig.authToken) {
            this.client = twilio(twilioConfig.accountSid, twilioConfig.authToken);
            this.phoneNumber = twilioConfig.phoneNumber;
            this.enabled = true;
        } else {
            console.warn(
                "⚠️  Twilio credentials not configured. WhatsApp disabled."
            );
            this.enabled = false;
        }
    }

    /**
     * Send WhatsApp message
     * @param {string} to - Recipient phone number (format: +971XXXXXXXXX)
     * @param {string} message - Message body
     */
    async sendWhatsApp(to, message) {
        if (!this.enabled) {
            console.log(`💬 WhatsApp (disabled): To=${to}, Message=${message}`);
            return { success: false, message: "WhatsApp service not configured" };
        }

        try {
            // Format numbers for WhatsApp (add whatsapp: prefix)
            const whatsappTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
            const whatsappFrom = this.phoneNumber.startsWith("whatsapp:")
                ? this.phoneNumber
                : `whatsapp:${this.phoneNumber}`;

            const result = await this.client.messages.create({
                body: message,
                from: whatsappFrom,
                to: whatsappTo,
            });

            console.log(`✅ WhatsApp sent to ${to}: ${result.sid}`);
            return { success: true, sid: result.sid, data: result };
        } catch (error) {
            console.error("❌ WhatsApp Error:", error);
            throw new Error(`Failed to send WhatsApp: ${error.message}`);
        }
    }

    /**
     * Send case notification via WhatsApp
     */
    async sendCaseNotification(to, caseNumber, message) {
        const text = `*LegalPath - Case ${caseNumber}*\n\n${message}`;
        return await this.sendWhatsApp(to, text);
    }

    /**
     * Send consultation reminder via WhatsApp
     */
    async sendConsultationReminder(to, consultationDate, counsellorName) {
        const text = `*LegalPath Consultation Reminder*\n\nYour consultation with ${counsellorName} is scheduled for ${consultationDate}.\n\nPlease be on time.`;
        return await this.sendWhatsApp(to, text);
    }
}

export default new WhatsAppService();
