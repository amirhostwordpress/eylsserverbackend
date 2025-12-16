import express from 'express';
import {
    createJail,
    getAllJails,
    getJailById,
    updateJail,
    deleteJail,
} from '../controllers/jail.controller.js';
import protect from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post('/', protect, authorize(['super_admin']), createJail);
router.get('/', protect, getAllJails);
router.get('/:id', protect, getJailById);
router.put('/:id', protect, authorize(['super_admin']), updateJail);
router.delete('/:id', protect, authorize(['super_admin']), deleteJail);

export default router;
