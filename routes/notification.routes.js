// Notification Routes
import express from "express";
import notificationController from "../controllers/notification.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { isStaff } from "../middleware/authorize.middleware.js";

const router = express.Router();

// All routes require authentication and staff access
router.use(authMiddleware, isStaff);

router.post("/sms", notificationController.sendSMS);
router.post("/whatsapp", notificationController.sendWhatsApp);
router.post("/email", notificationController.sendEmail);

export default router;
