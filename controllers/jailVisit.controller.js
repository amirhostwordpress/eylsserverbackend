import JailVisit from '../models/jailVisit.model.js';
import Jail from '../models/jail.model.js';
import Case from '../models/case.model.js';
import User from '../models/user.model.js';
import { Op } from 'sequelize';

// @desc    Create jail visit request
// @route   POST /api/jail-visits
// @access  Authenticated (Counselor/Lawyer/Admin)
export const createJailVisit = async (req, res) => {
    try {
        const { caseNumber, accusedName, jailId, requestedDate, requestedTime, reason } = req.body;

        if (!caseNumber || !accusedName || !jailId || !requestedDate || !requestedTime || !reason) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const jail = await Jail.findByPk(jailId);
        if (!jail) {
            return res.status(404).json({ message: 'Jail not found' });
        }

        const visit = await JailVisit.create({
            caseNumber,
            accusedName,
            jailId,
            emirate: jail.emirate,
            counselorId: req.user.id,
            requestedDate,
            requestedTime,
            reason,
            status: 'pending',
        });

        res.status(201).json({
            success: true,
            data: { jailVisit: visit },
            message: 'Jail visit request created successfully',
        });
    } catch (error) {
        console.error('Create jail visit error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all jail visits
// @route   GET /api/jail-visits
// @access  Authenticated
export const getAllJailVisits = async (req, res) => {
    try {
        const { status, emirate, counselorId, startDate, endDate } = req.query;

        const whereClause = {};

        // Role-based filtering
        if (req.user.role === 'counsellor') {
            whereClause.counselorId = req.user.id;
        } else if (counselorId) {
            whereClause.counselorId = counselorId;
        }

        if (status) whereClause.status = status;
        if (emirate) whereClause.emirate = emirate;

        if (startDate && endDate) {
            whereClause.requestedDate = {
                [Op.between]: [startDate, endDate],
            };
        }

        const visits = await JailVisit.findAll({
            where: whereClause,
            include: [
                {
                    model: Jail,
                    as: 'jail',
                    attributes: ['id', 'name', 'emirate'],
                },
                {
                    model: User,
                    as: 'counselor',
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

        res.json({
            success: true,
            data: {
                jailVisits: visits,
                count: visits.length,
            },
        });
    } catch (error) {
        console.error('Get jail visits error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single jail visit
// @route   GET /api/jail-visits/:id
// @access  Authenticated
export const getJailVisitById = async (req, res) => {
    try {
        const visit = await JailVisit.findByPk(req.params.id, {
            include: [
                { model: Jail, as: 'jail' },
                { model: User, as: 'counselor', attributes: ['id', 'name', 'email'] },
                { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
            ],
        });

        if (!visit) {
            return res.status(404).json({ message: 'Visit request not found' });
        }

        // Access control
        if (req.user.role === 'counsellor' && visit.counselorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this request' });
        }

        res.json(visit);
    } catch (error) {
        console.error('Get jail visit error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Approve/Reject/Update jail visit
// @route   PUT /api/jail-visits/:id/status
// @access  Super Admin / Lawyer
export const updateJailVisitStatus = async (req, res) => {
    try {
        const { status, remarks, rejectionReason } = req.body;

        if (!['approved', 'rejected', 'more_info_needed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const visit = await JailVisit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ message: 'Visit request not found' });
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

        await visit.update(updateData);

        res.json({
            success: true,
            data: { jailVisit: visit },
            message: 'Jail visit status updated successfully',
        });
    } catch (error) {
        console.error('Update jail visit status error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete jail visit
// @route   DELETE /api/jail-visits/:id
// @access  Authenticated
export const deleteJailVisit = async (req, res) => {
    try {
        const visit = await JailVisit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ message: 'Visit request not found' });
        }

        // Only allow deletion if pending, or if super admin
        if (visit.status !== 'pending' && req.user.role !== 'super_admin') {
            return res.status(400).json({ message: 'Cannot delete processed requests' });
        }

        if (req.user.role === 'counsellor' && visit.counselorId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this request' });
        }

        await visit.destroy();

        res.json({
            success: true,
            message: 'Visit request deleted successfully',
        });
    } catch (error) {
        console.error('Delete jail visit error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
