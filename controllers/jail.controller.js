import Jail from '../models/jail.model.js';
import PoliceStation from '../models/policeStation.model.js';
import { Op } from 'sequelize';

// @desc    Create jail
// @route   POST /api/jails
// @access  Super Admin
export const createJail = async (req, res) => {
    try {
        const { name, policeStationId, jailType, capacity, description } = req.body;

        if (!name || !policeStationId || !jailType) {
            return res.status(400).json({ message: 'Name, police station, and jail type are required' });
        }

        const policeStation = await PoliceStation.findByPk(policeStationId);
        if (!policeStation) {
            return res.status(404).json({ message: 'Police station not found' });
        }

        const jail = await Jail.create({
            name,
            policeStationId,
            emirate: policeStation.emirate, // Auto-fill emirate from police station
            jailType,
            capacity,
            description,
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            data: { jail },
            message: 'Jail created successfully',
        });
    } catch (error) {
        console.error('Create jail error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all jails
// @route   GET /api/jails
// @access  Authenticated
export const getAllJails = async (req, res) => {
    try {
        const { emirate, policeStationId, search, includeInactive } = req.query;

        const whereClause = includeInactive === 'true' ? {} : { isActive: true };

        if (emirate && emirate !== 'all') {
            whereClause.emirate = emirate;
        }

        if (policeStationId) {
            whereClause.policeStationId = policeStationId;
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
            ];
        }

        const jails = await Jail.findAll({
            where: whereClause,
            include: [
                {
                    model: PoliceStation,
                    as: 'policeStation',
                    attributes: ['id', 'name', 'emirate'],
                },
            ],
            order: [['name', 'ASC']],
        });

        res.json({
            success: true,
            data: {
                jails,
                count: jails.length,
            },
        });
    } catch (error) {
        console.error('Get jails error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single jail
// @route   GET /api/jails/:id
// @access  Authenticated
export const getJailById = async (req, res) => {
    try {
        const jail = await Jail.findByPk(req.params.id, {
            include: [
                {
                    model: PoliceStation,
                    as: 'policeStation',
                },
            ],
        });

        if (!jail) {
            return res.status(404).json({ message: 'Jail not found' });
        }

        res.json(jail);
    } catch (error) {
        console.error('Get jail error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update jail
// @route   PUT /api/jails/:id
// @access  Super Admin
export const updateJail = async (req, res) => {
    try {
        const { name, policeStationId, jailType, capacity, description, isActive } = req.body;

        const jail = await Jail.findByPk(req.params.id);
        if (!jail) {
            return res.status(404).json({ message: 'Jail not found' });
        }

        let emirate = jail.emirate;

        if (policeStationId && policeStationId !== jail.policeStationId) {
            const policeStation = await PoliceStation.findByPk(policeStationId);
            if (!policeStation) {
                return res.status(404).json({ message: 'Police station not found' });
            }
            emirate = policeStation.emirate;
        }

        await jail.update({
            name,
            policeStationId,
            emirate,
            jailType,
            capacity,
            description,
            isActive,
        });

        res.json({
            success: true,
            data: { jail },
            message: 'Jail updated successfully',
        });
    } catch (error) {
        console.error('Update jail error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete jail
// @route   DELETE /api/jails/:id
// @access  Super Admin
export const deleteJail = async (req, res) => {
    try {
        const jail = await Jail.findByPk(req.params.id);
        if (!jail) {
            return res.status(404).json({ message: 'Jail not found' });
        }

        await jail.destroy();

        res.json({
            success: true,
            message: 'Jail deleted successfully',
        });
    } catch (error) {
        console.error('Delete jail error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
