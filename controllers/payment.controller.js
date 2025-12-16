// Payment Controller - Simplified
import Payment from "../models/payment.model.js";
import { generateInvoiceNumber } from "../utils/helpers.js";

export const createPayment = async (req, res) => {
    try {
        let invoiceNumber;
        let isUnique = false;
        while (!isUnique) {
            invoiceNumber = generateInvoiceNumber();
            const existing = await Payment.findOne({ where: { invoiceNumber } });
            if (!existing) isUnique = true;
        }

        const payment = await Payment.create({
            ...req.body,
            clientId: req.userId,
            invoiceNumber,
            invoiceDate: new Date(),
            status: "pending",
        });

        res.status(201).json({
            success: true,
            message: "Payment record created",
            data: { payment },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create payment",
            error: error.message,
        });
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const where = {};
        if (req.user.role === "client") {
            where.clientId = req.userId;
        }

        const payments = await Payment.findAll({
            where,
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: { payments },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message,
        });
    }
};

export const getPaymentsByCase = async (req, res) => {
    try {
        const { caseId } = req.params;

        const payments = await Payment.findAll({
            where: { caseId },
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: { payments },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message,
        });
    }
};

export default {
    createPayment,
    getAllPayments,
    getPaymentsByCase,
};
