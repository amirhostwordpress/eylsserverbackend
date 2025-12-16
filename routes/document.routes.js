// Document Routes
import express from "express";
import documentController from "../controllers/document.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { uploadSingle, handleUploadError } from "../middleware/upload.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Upload document
router.post("/upload", uploadSingle, handleUploadError, documentController.uploadDocument);

// Get documents by case
router.get("/case/:caseId", documentController.getDocumentsByCase);

// Delete document
router.delete("/:id", authorize(["super_admin", "coordinator"]), documentController.deleteDocument);

export default router;
