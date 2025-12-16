import express from 'express';
import {
    createOccupationType,
    getAllOccupationTypes,
    updateOccupationType,
    deleteOccupationType,
    createOccupationSubType,
    getAllOccupationSubTypes,
    getSubTypesByType,
    updateOccupationSubType,
    deleteOccupationSubType,
} from '../controllers/workOccupation.controller.js';
import protect from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

// Work Occupation Types routes
router.post('/types', protect, authorize(['super_admin']), createOccupationType);
router.get('/types', protect, getAllOccupationTypes);
router.put('/types/:id', protect, authorize(['super_admin']), updateOccupationType);
router.delete('/types/:id', protect, authorize(['super_admin']), deleteOccupationType);

// Work Occupation Sub-Types routes
router.post('/sub-types', protect, authorize(['super_admin']), createOccupationSubType);
router.get('/sub-types', protect, getAllOccupationSubTypes);
router.get('/sub-types/by-type/:typeId', protect, getSubTypesByType);
router.put('/sub-types/:id', protect, authorize(['super_admin']), updateOccupationSubType);
router.delete('/sub-types/:id', protect, authorize(['super_admin']), deleteOccupationSubType);

export default router;
