// Dashboard Controller - Simplified
import Case from "../models/case.model.js";
import User from "../models/user.model.js";
import Payment from "../models/payment.model.js";
import Consultation from "../models/consultation.model.js";
import { Op } from "sequelize";

export const getSuperAdminDashboard = async (req, res) => {
    try {
        const totalCases = await Case.count();
        const totalUsers = await User.count();
        const totalPayments = await Payment.sum("amount");
        const pendingCases = await Case.count({ where: { status: "pending" } });

        res.json({
            success: true,
            data: {
                totalCases,
                totalUsers,
                totalRevenue: totalPayments || 0,
                pendingCases,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};

export const getCoordinatorDashboard = async (req, res) => {
    try {
        const myCases = await Case.count({ where: { coordinatorId: req.userId } });
        const pendingAssignment = await Case.count({
            where: { coordinatorId: req.userId, lawyerId: null },
        });
        const activeCases = await Case.count({
            where: { coordinatorId: req.userId, status: "active" },
        });

        res.json({
            success: true,
            data: {
                myCases,
                pendingAssignment,
                activeCases,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};

export const getLawyerDashboard = async (req, res) => {
    try {
        const assignedCases = await Case.count({ where: { lawyerId: req.userId } });
        const activeCases = await Case.count({
            where: { lawyerId: req.userId, status: "active" },
        });

        res.json({
            success: true,
            data: {
                assignedCases,
                activeCases,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};

export const getClientDashboard = async (req, res) => {
    try {
        const myCase = await Case.findOne({
            where: { clientId: req.userId },
            include: [
                { model: User, as: "lawyer", attributes: ["name", "email", "phone"] },
            ],
        });

        const myPayments = await Payment.sum("amount", {
            where: { clientId: req.userId },
        });

        res.json({
            success: true,
            data: {
                case: myCase,
                totalPaid: myPayments || 0,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};

export const getCounsellorDashboard = async (req, res) => {
    try {
        // For now, Counsellor sees similar stats to Coordinator but limited to their scope if needed
        // Assuming Counsellor might be assigned cases or just general view
        // Adjust logic based on specific requirements. For now, returning basic stats.

        const totalCases = await Case.count();
        const activeCases = await Case.count({ where: { status: "active" } });

        res.json({
            success: true,
            data: {
                totalCases,
                activeCases,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message,
        });
    }
};

export default {
    getSuperAdminDashboard,
    getCoordinatorDashboard,
    getLawyerDashboard,
    getClientDashboard,
    getCounsellorDashboard,
};
