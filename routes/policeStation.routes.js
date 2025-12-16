import express from 'express';
import {
    createPoliceStation,
    getAllPoliceStations,
    getPoliceStationById,
    updatePoliceStation,
    deletePoliceStation,
    getPoliceStationStats,
    exportPoliceStations,
    importPoliceStations,
} from '../controllers/policeStation.controller.js';
import protect from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post('/', protect, authorize(['super_admin']), createPoliceStation);
router.get('/', protect, getAllPoliceStations);
router.get('/stats/overview', protect, getPoliceStationStats);
router.get('/export', protect, exportPoliceStations);
router.post('/import', protect, authorize(['super_admin']), importPoliceStations);
router.get('/:id', protect, getPoliceStationById);
router.put('/:id', protect, authorize(['super_admin']), updatePoliceStation);
router.delete('/:id', protect, authorize(['super_admin']), deletePoliceStation);

export default router;
