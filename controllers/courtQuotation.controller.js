import CourtQuotation from '../models/courtQuotation.model.js';
import Case from '../models/case.model.js';
import User from '../models/user.model.js';
import { Op } from 'sequelize';

// @desc    Create court quotation
// @route   POST /api/court-quotations
// @access  Authenticated (Counselor)
export const createCourtQuotation = async (req, res) => {
    try {
        const { caseNumber, emirate, court, clientName, clientContact, feeAmount, notes } = req.body;

        if (!caseNumber || !emirate || !court || !clientName || !feeAmount) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        const quotation = await CourtQuotation.create({
            caseNumber,
            emirate,
            court,
            clientName,
            clientContact,
            feeAmount,
            notes,
            status: 'pending',
            createdBy: req.user.id,
        });

        res.status(201).json(quotation);
    } catch (error) {
        console.error('Create court quotation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all court quotations
// @route   GET /api/court-quotations
// @access  Authenticated
export const getAllCourtQuotations = async (req, res) => {
    try {
        const { status, emirate, createdBy, startDate, endDate } = req.query;

        const whereClause = {};

        // Role-based filtering
        if (req.user.role === 'counsellor') {
            whereClause.createdBy = req.user.id;
        } else if (createdBy) {
            whereClause.createdBy = createdBy;
        }

        if (status) whereClause.status = status;
        if (emirate) whereClause.emirate = emirate;

        if (startDate && endDate) {
            whereClause.createdAt = {
                [Op.between]: [startDate, endDate],
            };
        }

        const quotations = await CourtQuotation.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'name', 'email'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json(quotations);
    } catch (error) {
        console.error('Get court quotations error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single court quotation
// @route   GET /api/court-quotations/:id
// @access  Authenticated
export const getCourtQuotationById = async (req, res) => {
    try {
        const quotation = await CourtQuotation.findByPk(req.params.id, {
            include: [
                { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
            ],
        });

        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        // Access control
        if (req.user.role === 'counsellor' && quotation.createdBy !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this quotation' });
        }

        res.json(quotation);
    } catch (error) {
        console.error('Get court quotation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve/Reject court quotation
// @route   PUT /api/court-quotations/:id/status
// @access  Super Admin / Lawyer
export const updateCourtQuotationStatus = async (req, res) => {
    try {
        const { status, remarks, rejectionReason } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const quotation = await CourtQuotation.findByPk(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        const updateData = {
            status,
            remarks,
            approvedBy: req.user.id,
            approvedDate: new Date(),
        };

        if (status === 'rejected') {
            updateData.rejectionReason = rejectionReason || remarks;
        }

        await quotation.update(updateData);

        // If approved, update Case status to 'in_progress' (Running)
        if (status === 'approved') {
            const caseRecord = await Case.findOne({ where: { caseNumber: quotation.caseNumber } });
            if (caseRecord) {
                await caseRecord.update({
                    status: 'in_progress',
                    lawyerId: req.user.id, // Assign approving lawyer/admin as lawyer? Or keep existing?
                    // Assuming the approver becomes the assigned lawyer if not already assigned
                });
            }
        }

        res.json(quotation);
    } catch (error) {
        console.error('Update court quotation status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete court quotation
// @route   DELETE /api/court-quotations/:id
// @access  Authenticated
export const deleteCourtQuotation = async (req, res) => {
    try {
        const quotation = await CourtQuotation.findByPk(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }

        // Only allow deletion if pending, or if super admin
        if (quotation.status !== 'pending' && req.user.role !== 'super_admin') {
            return res.status(400).json({ message: 'Cannot delete processed quotations' });
        }

        if (req.user.role === 'counsellor' && quotation.createdBy !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this quotation' });
        }

        await quotation.destroy();

        res.json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        console.error('Delete court quotation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
