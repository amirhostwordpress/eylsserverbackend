// Case Tracking Controller
import CaseTracking from "../models/caseTracking.model.js";
import Case from "../models/case.model.js";
import User from "../models/user.model.js";
import { Op } from "sequelize";

/**
 * @desc    Get all tracking records for a case
 * @route   GET /api/cases/:caseId/tracking
 * @access  Authenticated
 */
export const getTrackingRecords = async (req, res) => {
    try {
        const { caseId } = req.params;

        console.log('\n📝 GET Tracking Records for case:', caseId);

        // Verify case exists
        const caseData = await Case.findByPk(caseId);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        const records = await CaseTracking.findAll({
            where: { caseId },
            include: [
                { model: User, as: "user", attributes: ["id", "name", "email"] }
            ],
            order: [["changeNumber", "DESC"]],
        });

        console.log('✅ Found', records.length, 'tracking records\n');

        res.json({
            success: true,
            data: { trackingRecords: records },
        });
    } catch (error) {
        console.error("❌ Get tracking records error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch tracking records",
            error: error.message,
        });
    }
};

/**
 * @desc    Add new tracking record
 * @route   POST /api/cases/:caseId/tracking
 * @access  Authenticated
 */
export const addTrackingRecord = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { nextHearing, reason, actionRequired, dateOfActionRequired, workUndertaken, other, staffName } = req.body;

        console.log('\n➕ ADD Tracking Record for case:', caseId);

        // Verify case exists
        const caseData = await Case.findByPk(caseId);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // Get last tracking number
        const lastTracking = await CaseTracking.findOne({
            where: { caseId },
            order: [["changeNumber", "DESC"]],
        });

        const newRecord = await CaseTracking.create({
            caseId,
            userId: req.userId,
            changeNumber: (lastTracking?.changeNumber || 0) + 1,
            changeType: 'manual_entry',
            nextHearing,
            reason,
            actionRequired,
            dateOfActionRequired,
            workUndertaken,
            other,
            staffName,
            description: `Manual tracking entry added by ${req.user?.name || 'user'}`,
        });

        console.log('✅ Created tracking record:', newRecord.id, '\n');

        res.status(201).json({
            success: true,
            data: { trackingRecord: newRecord },
        });
    } catch (error) {
        console.error("❌ Add tracking record error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add tracking record",
            error: error.message,
        });
    }
};

/**
 * @desc    Update tracking record
 * @route   PUT /api/cases/:caseId/tracking/:id
 * @access  Authenticated
 */
export const updateTrackingRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { nextHearing, reason, actionRequired, dateOfActionRequired, workUndertaken, other, staffName } = req.body;

        console.log('\n↻ UPDATE Tracking Record:', id);

        const record = await CaseTracking.findByPk(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Tracking record not found",
            });
        }

        await record.update({
            nextHearing,
            reason,
            actionRequired,
            dateOfActionRequired,
            workUndertaken,
            other,
            staffName,
        });

        console.log('✅ Updated tracking record\n');

        res.json({
            success: true,
            data: { trackingRecord: record },
        });
    } catch (error) {
        console.error("❌ Update tracking record error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update tracking record",
            error: error.message,
        });
    }
};

/**
 * @desc    Delete tracking record
 * @route   DELETE /api/cases/:caseId/tracking/:id
 * @access  Authenticated
 */
export const deleteTrackingRecord = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('\n🗑️  DELETE Tracking Record:', id);

        const record = await CaseTracking.findByPk(id);
        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Tracking record not found",
            });
        }

        await record.destroy();

        console.log('✅ Deleted tracking record\n');

        res.json({
            success: true,
            message: "Tracking record deleted successfully",
        });
    } catch (error) {
        console.error("❌ Delete tracking record error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete tracking record",
            error: error.message,
        });
    }
};
