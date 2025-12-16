// Consultation Routes
import express from "express";
import consultationController from "../controllers/consultation.controller.js";
import authMiddleware, { optionalAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public route for booking consultation
router.post("/", optionalAuth, consultationController.createConsultation);

// Auth required for other routes
router.use(authMiddleware);

router.get("/", consultationController.getAllConsultations);
router.put("/:id", consultationController.updateConsultation);

export default router;
