import PoliceStation from '../models/policeStation.model.js';
import Jail from '../models/jail.model.js';
import { Op } from 'sequelize';
import { exportToCSV, exportToJSON, importFromCSV, importFromJSON } from '../utils/exportImport.js';

// @desc    Create police station
// @route   POST /api/police-stations
// @access  Super Admin
export const createPoliceStation = async (req, res) => {
    try {
        const { name, emirate, address, contactNumber, officerInCharge } = req.body;

        if (!name || !emirate || !address || !contactNumber) {
            return res.status(400).json({ message: 'Name, emirate, address, and contact number are required' });
        }

        const station = await PoliceStation.create({
            name,
            emirate,
            address,
            contactNumber,
            officerInCharge,
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            data: { policeStation: station },
            message: 'Police station created successfully',
        });
    } catch (error) {
        console.error('Create police station error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all police stations
// @route   GET /api/police-stations
// @access  Authenticated
export const getAllPoliceStations = async (req, res) => {
    try {
        const { emirate, search, includeInactive } = req.query;

        const whereClause = includeInactive === 'true' ? {} : { isActive: true };

        if (emirate && emirate !== 'all') {
            whereClause.emirate = emirate;
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { address: { [Op.like]: `%${search}%` } },
                { officerInCharge: { [Op.like]: `%${search}%` } },
            ];
        }

        const stations = await PoliceStation.findAll({
            where: whereClause,
            include: [
                {
                    model: Jail,
                    as: 'jails',
                    required: false,
                    where: includeInactive === 'true' ? {} : { isActive: true },
                },
            ],
            order: [['name', 'ASC']],
        });

        res.json({
            success: true,
            data: {
                policeStations: stations,
                count: stations.length,
            },
        });
    } catch (error) {
        console.error('Get police stations error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single police station
// @route   GET /api/police-stations/:id
// @access  Authenticated
export const getPoliceStationById = async (req, res) => {
    try {
        const station = await PoliceStation.findByPk(req.params.id, {
            include: [
                {
                    model: Jail,
                    as: 'jails',
                },
            ],
        });

        if (!station) {
            return res.status(404).json({ message: 'Police station not found' });
        }

        res.json(station);
    } catch (error) {
        console.error('Get police station error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update police station
// @route   PUT /api/police-stations/:id
// @access  Super Admin
export const updatePoliceStation = async (req, res) => {
    try {
        const { name, emirate, address, contactNumber, officerInCharge, isActive } = req.body;

        const station = await PoliceStation.findByPk(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'Police station not found' });
        }

        await station.update({
            name,
            emirate,
            address,
            contactNumber,
            officerInCharge,
            isActive,
        });

        res.json({
            success: true,
            data: { policeStation: station },
            message: 'Police station updated successfully',
        });
    } catch (error) {
        console.error('Update police station error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete police station
// @route   DELETE /api/police-stations/:id
// @access  Super Admin
export const deletePoliceStation = async (req, res) => {
    try {
        const station = await PoliceStation.findByPk(req.params.id);
        if (!station) {
            return res.status(404).json({ message: 'Police station not found' });
        }

        const jailCount = await Jail.count({ where: { policeStationId: req.params.id } });

        await station.destroy();

        res.json({
            success: true,
            message: 'Police station deleted successfully',
            deletedJails: jailCount,
        });
    } catch (error) {
        console.error('Delete police station error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get statistics
// @route   GET /api/police-stations/stats/overview
// @access  Authenticated
export const getPoliceStationStats = async (req, res) => {
    try {
        const stationsByEmirate = await PoliceStation.findAll({
            attributes: ['emirate', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            where: { isActive: true },
            group: ['emirate'],
        });

        const totalStations = await PoliceStation.count({ where: { isActive: true } });

        res.json({
            total: totalStations,
            byEmirate: stationsByEmirate,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Export police stations
// @route   GET /api/police-stations/export
// @access  Authenticated
export const exportPoliceStations = async (req, res) => {
    try {
        const { format } = req.query;
        const stations = await PoliceStation.findAll({
            attributes: ['name', 'emirate', 'address', 'contactNumber', 'officerInCharge', 'isActive', 'createdAt'],
            raw: true,
        });

        if (format === 'csv') {
            const csvData = exportToCSV(stations);
            res.header('Content-Type', 'text/csv');
            res.attachment('police_stations.csv');
            return res.send(csvData);
        } else {
            const jsonData = exportToJSON(stations);
            res.header('Content-Type', 'application/json');
            res.attachment('police_stations.json');
            return res.send(jsonData);
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ message: 'Export failed', error: error.message });
    }
};

// @desc    Import police stations
// @route   POST /api/police-stations/import
// @access  Super Admin
export const importPoliceStations = async (req, res) => {
    try {
        const { data, format } = req.body; // Expecting raw data string or JSON object

        if (!data) {
            return res.status(400).json({ message: 'Data is required' });
        }

        let parsedData;
        if (format === 'csv') {
            parsedData = await importFromCSV(data);
        } else {
            parsedData = typeof data === 'string' ? importFromJSON(data) : data;
        }

        if (!Array.isArray(parsedData)) {
            return res.status(400).json({ message: 'Invalid data format. Expected an array.' });
        }

        // Validate and insert
        const results = {
            success: 0,
            failed: 0,
            errors: [],
        };

        for (const item of parsedData) {
            try {
                // Basic validation
                if (!item.name || !item.emirate) {
                    throw new Error('Name and Emirate are required');
                }

                await PoliceStation.create({
                    name: item.name,
                    emirate: item.emirate,
                    address: item.address || 'N/A',
                    contactNumber: item.contactNumber || 'N/A',
                    officerInCharge: item.officerInCharge,
                    createdBy: req.user.id,
                });
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ item: item.name || 'Unknown', error: err.message });
            }
        }

        res.json({
            message: 'Import completed',
            results,
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ message: 'Import failed', error: error.message });
    }
};
