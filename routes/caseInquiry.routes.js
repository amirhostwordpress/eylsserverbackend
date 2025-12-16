import express from "express";
import caseInquiryController from "../controllers/caseInquiry.controller.js";
import authMiddleware, { optionalAuth } from "../middleware/auth.middleware.js";
import { uploadCaseDocuments } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public route for submitting inquiry (uses case-specific upload directory)
router.post("/", optionalAuth, uploadCaseDocuments, caseInquiryController.createInquiry);

// Admin routes
router.use(authMiddleware);

router.get("/", caseInquiryController.getAllInquiries);
router.put("/:id/status", caseInquiryController.updateInquiryStatus);
router.delete("/:id", caseInquiryController.deleteInquiry);

export default router;
