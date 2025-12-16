// Payment Routes
import express from "express";
import paymentController from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post("/", paymentController.createPayment);
router.get("/", paymentController.getAllPayments);
router.get("/case/:caseId", paymentController.getPaymentsByCase);

export default router;
