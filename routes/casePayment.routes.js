import express from 'express';
import * as paymentController from '../controllers/casePayment.controller.js';
import { authMiddleware as protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Case Payment Routes
router.get('/:caseId/payments', paymentController.getPayments);
router.post('/:caseId/payments', paymentController.addPayment);
router.put('/:caseId/payments/:id', paymentController.updatePayment);
router.delete('/:caseId/payments/:id', paymentController.deletePayment);

export default router;
