// Notification Controller - Simplified
import Notification from "../models/notification.model.js";
import smsService from "../utils/smsService.js";
import emailService from "../utils/emailService.js";
import whatsappService from "../utils/whatsappService.js";

export const sendSMS = async (req, res) => {
    try {
        const { userId, phone, message } = req.body;

        const result = await smsService.sendSMS(phone, message);

        await Notification.create({
            userId,
            type: "sms",
            message,
            status: result.success ? "sent" : "failed",
            sentAt: result.success ? new Date() : null,
        });

        res.json({
            success: true,
            message: "SMS sent successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send SMS",
            error: error.message,
        });
    }
};

export const sendWhatsApp = async (req, res) => {
    try {
        const { userId, phone, message } = req.body;

        const result = await whatsappService.sendWhatsApp(phone, message);

        await Notification.create({
            userId,
            type: "whatsapp",
            message,
            status: result.success ? "sent" : "failed",
            sentAt: result.success ? new Date() : null,
        });

        res.json({
            success: true,
            message: "WhatsApp sent successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send WhatsApp",
            error: error.message,
        });
    }
};

export const sendEmail = async (req, res) => {
    try {
        const { userId, email, subject, html } = req.body;

        const result = await emailService.sendEmail(email, subject, emailService.wrapHtml(html));

        await Notification.create({
            userId,
            type: "email",
            message: subject,
            status: result.success ? "sent" : "failed",
            sentAt: result.success ? new Date() : null,
        });

        res.json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send email",
            error: error.message,
        });
    }
};

export default {
    sendSMS,
    sendWhatsApp,
    sendEmail,
};
