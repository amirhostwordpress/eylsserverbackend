import WorkOccupationType from '../models/workOccupationType.model.js';
import WorkOccupationSubType from '../models/workOccupationSubType.model.js';

// ============ WORK OCCUPATION TYPES ============

// @desc    Create work occupation type
// @route   POST /api/work-occupations/types
// @access  Super Admin
export const createOccupationType = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const existing = await WorkOccupationType.findOne({ where: { name } });
        if (existing) {
            return res.status(400).json({ message: 'Occupation type with this name already exists' });
        }

        const occupationType = await WorkOccupationType.create({
            name,
            createdBy: req.user.id,
        });

        res.status(201).json(occupationType);
    } catch (error) {
        console.error('Create occupation type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all work occupation types
// @route   GET /api/work-occupations/types
// @access  Authenticated
export const getAllOccupationTypes = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const whereClause = includeInactive === 'true' ? {} : { isActive: true };

        const occupationTypes = await WorkOccupationType.findAll({
            where: whereClause,
            include: [
                {
                    model: WorkOccupationSubType,
                    as: 'subTypes',
                    where: includeInactive === 'true' ? {} : { isActive: true },
                    required: false,
                },
            ],
            order: [['name', 'ASC']],
        });

        res.json(occupationTypes);
    } catch (error) {
        console.error('Get occupation types error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update work occupation type
// @route   PUT /api/work-occupations/types/:id
// @access  Super Admin
export const updateOccupationType = async (req, res) => {
    try {
        const { name, isActive } = req.body;

        const occupationType = await WorkOccupationType.findByPk(req.params.id);
        if (!occupationType) {
            return res.status(404).json({ message: 'Occupation type not found' });
        }

        if (name && name !== occupationType.name) {
            const existing = await WorkOccupationType.findOne({ where: { name } });
            if (existing) {
                return res.status(400).json({ message: 'Occupation type with this name already exists' });
            }
        }

        await occupationType.update({ name, isActive });

        res.json(occupationType);
    } catch (error) {
        console.error('Update occupation type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete work occupation type (cascade)
// @route   DELETE /api/work-occupations/types/:id
// @access  Super Admin
export const deleteOccupationType = async (req, res) => {
    try {
        const occupationType = await WorkOccupationType.findByPk(req.params.id);
        if (!occupationType) {
            return res.status(404).json({ message: 'Occupation type not found' });
        }

        const subTypeCount = await WorkOccupationSubType.count({ where: { occupationTypeId: req.params.id } });

        await occupationType.destroy();

        res.json({
            message: 'Occupation type deleted successfully',
            deletedSubTypes: subTypeCount,
        });
    } catch (error) {
        console.error('Delete occupation type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ============ WORK OCCUPATION SUB-TYPES ============

// @desc    Create work occupation sub-type
// @route   POST /api/work-occupations/sub-types
// @access  Super Admin
export const createOccupationSubType = async (req, res) => {
    try {
        const { name, occupationTypeId } = req.body;

        if (!name || !occupationTypeId) {
            return res.status(400).json({ message: 'Name and occupation type ID are required' });
        }

        const occupationType = await WorkOccupationType.findByPk(occupationTypeId);
        if (!occupationType) {
            return res.status(404).json({ message: 'Occupation type not found' });
        }

        const subType = await WorkOccupationSubType.create({
            name,
            occupationTypeId,
        });

        res.status(201).json(subType);
    } catch (error) {
        console.error('Create occupation sub-type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all work occupation sub-types
// @route   GET /api/work-occupations/sub-types
// @access  Authenticated
export const getAllOccupationSubTypes = async (req, res) => {
    try {
        const { includeInactive } = req.query;
        const whereClause = includeInactive === 'true' ? {} : { isActive: true };

        const subTypes = await WorkOccupationSubType.findAll({
            where: whereClause,
            include: [
                {
                    model: WorkOccupationType,
                    as: 'occupationType',
                },
            ],
            order: [['name', 'ASC']],
        });

        res.json(subTypes);
    } catch (error) {
        console.error('Get occupation sub-types error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get sub-types by occupation type
// @route   GET /api/work-occupations/sub-types/by-type/:typeId
// @access  Authenticated
export const getSubTypesByType = async (req, res) => {
    try {
        const subTypes = await WorkOccupationSubType.findAll({
            where: {
                occupationTypeId: req.params.typeId,
                isActive: true
            },
            order: [['name', 'ASC']],
        });

        res.json(subTypes);
    } catch (error) {
        console.error('Get sub-types by type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update work occupation sub-type
// @route   PUT /api/work-occupations/sub-types/:id
// @access  Super Admin
export const updateOccupationSubType = async (req, res) => {
    try {
        const { name, occupationTypeId, isActive } = req.body;

        const subType = await WorkOccupationSubType.findByPk(req.params.id);
        if (!subType) {
            return res.status(404).json({ message: 'Occupation sub-type not found' });
        }

        if (occupationTypeId) {
            const occupationType = await WorkOccupationType.findByPk(occupationTypeId);
            if (!occupationType) {
                return res.status(404).json({ message: 'Occupation type not found' });
            }
        }

        await subType.update({ name, occupationTypeId, isActive });

        res.json(subType);
    } catch (error) {
        console.error('Update occupation sub-type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete work occupation sub-type
// @route   DELETE /api/work-occupations/sub-types/:id
// @access  Super Admin
export const deleteOccupationSubType = async (req, res) => {
    try {
        const subType = await WorkOccupationSubType.findByPk(req.params.id);
        if (!subType) {
            return res.status(404).json({ message: 'Occupation sub-type not found' });
        }

        await subType.destroy();

        res.json({ message: 'Occupation sub-type deleted successfully' });
    } catch (error) {
        console.error('Delete occupation sub-type error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
