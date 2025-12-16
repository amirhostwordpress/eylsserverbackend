// Case Routes
import express from "express";
import caseController from "../controllers/case.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authorize, isSuperAdmin, isCoordinator } from "../middleware/authorize.middleware.js";
import { filterByEmirates, checkEmirateAccess } from "../middleware/emirate.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Search for existing client
router.get("/search-client", authorize(["super_admin", "coordinator"]), caseController.searchExistingClient);

// Register case (Coordinator/Super Admin)
router.post("/", authorize(["super_admin", "coordinator"]), checkEmirateAccess, caseController.registerCase);

// Get all cases (role-based filtering applied)
router.get("/", filterByEmirates, caseController.getAllCases);

// Get case by ID
router.get("/:id", caseController.getCaseById);

// Update case
router.put("/:id", authorize(["super_admin", "coordinator", "lawyer", "counsellor"]), caseController.updateCase);

// Delete case (Super Admin or Coordinator for their own cases)
router.delete("/:id", authorize(["super_admin", "coordinator"]), caseController.deleteCase);

// Assign lawyer
router.put("/:id/assign-lawyer", authorize(["super_admin", "coordinator"]), caseController.assignLawyer);

// Update status
router.put("/:id/status", authorize(["super_admin", "coordinator", "lawyer", "counsellor"]), caseController.updateCaseStatus);

// Add note
router.post("/:id/notes", authorize(["super_admin", "coordinator", "lawyer", "counsellor"]), caseController.addCaseNote);

export default router;
