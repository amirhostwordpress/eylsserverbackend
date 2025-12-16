import express from 'express';
import {
    createCourtQuotation,
    getAllCourtQuotations,
    getCourtQuotationById,
    updateCourtQuotationStatus,
    deleteCourtQuotation,
} from '../controllers/courtQuotation.controller.js';
import protect from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post('/', protect, createCourtQuotation);
router.get('/', protect, getAllCourtQuotations);
router.get('/:id', protect, getCourtQuotationById);
router.put('/:id/status', protect, authorize(['super_admin', 'lawyer']), updateCourtQuotationStatus);
router.delete('/:id', protect, deleteCourtQuotation);

export default router;
