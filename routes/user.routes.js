// User Routes
import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authorize, isSuperAdmin } from "../middleware/authorize.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Lawyers list - accessible by coordinators and super admins
router.get("/lawyers", authorize(['super_admin', 'coordinator']), userController.getLawyers);

// Case statistics - accessible by super admins
router.get("/case-statistics", isSuperAdmin, userController.getCaseStatistics);

// Super Admin only routes
router.post("/import", isSuperAdmin, userController.bulkImportClients);
router.post("/", isSuperAdmin, userController.createUser);
router.get("/", isSuperAdmin, userController.getAllUsers);
router.delete("/:id", isSuperAdmin, userController.deleteUser);
router.put("/:id/emirates", isSuperAdmin, userController.assignEmirates);
router.post("/:id/reset-password", isSuperAdmin, userController.resetPasswordByAdmin);

// Self or SuperAdmin
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);

// Self only
router.post("/change-password", userController.changePassword);

export default router;
