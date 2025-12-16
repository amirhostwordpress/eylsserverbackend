// Consultation Controller - Simplified
import Consultation from "../models/consultation.model.js";

export const createConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.create({
            ...req.body,
            clientId: req.userId || null,
            status: "pending",
            paymentStatus: "pending", // Default to pending since no gateway
            paymentMethod: req.body.paymentMethod || "later",
        });

        res.status(201).json({
            success: true,
            message: "Consultation booked successfully",
            data: { consultation },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to book consultation",
            error: error.message,
        });
    }
};

export const getAllConsultations = async (req, res) => {
    try {
        const where = {};
        if (req.user.role === "client") where.clientId = req.userId;
        if (req.user.role === "counsellor") where.counsellorId = req.userId;
        if (req.user.role === "lawyer") where.lawyerId = req.userId;

        const consultations = await Consultation.findAll({
            where,
            order: [["scheduledDate", "DESC"]],
        });

        res.json({
            success: true,
            data: { consultations },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch consultations",
            error: error.message,
        });
    }
};

export const updateConsultation = async (req, res) => {
    try {
        const { id } = req.params;
        const consultation = await Consultation.findByPk(id);

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found",
            });
        }

        await consultation.update(req.body);

        res.json({
            success: true,
            message: "Consultation updated successfully",
            data: { consultation },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update consultation",
            error: error.message,
        });
    }
};

export default {
    createConsultation,
    getAllConsultations,
    updateConsultation,
};
