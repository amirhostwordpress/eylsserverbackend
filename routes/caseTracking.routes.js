import express from 'express';
import * as trackingController from '../controllers/caseTracking.controller.js';
import { authMiddleware as protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Case Tracking Routes
router.get('/:caseId/tracking', trackingController.getTrackingRecords);
router.post('/:caseId/tracking', trackingController.addTrackingRecord);
router.put('/:caseId/tracking/:id', trackingController.updateTrackingRecord);
router.delete('/:caseId/tracking/:id', trackingController.deleteTrackingRecord);

export default router;
