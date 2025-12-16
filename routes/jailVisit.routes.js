import express from 'express';
import {
    createJailVisit,
    getAllJailVisits,
    getJailVisitById,
    updateJailVisitStatus,
    deleteJailVisit,
} from '../controllers/jailVisit.controller.js';
import protect from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post('/', protect, createJailVisit);
router.get('/', protect, getAllJailVisits);
router.get('/:id', protect, getJailVisitById);
router.put('/:id/status', protect, authorize(['super_admin', 'lawyer']), updateJailVisitStatus);
router.delete('/:id', protect, deleteJailVisit);

export default router;
