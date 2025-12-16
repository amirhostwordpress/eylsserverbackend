// Dashboard Routes
import express from "express";
import dashboardController from "../controllers/dashboard.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get("/super-admin", authorize(["super_admin"]), dashboardController.getSuperAdminDashboard);
router.get("/coordinator", authorize(["coordinator"]), dashboardController.getCoordinatorDashboard);
router.get("/lawyer", authorize(["lawyer"]), dashboardController.getLawyerDashboard);
router.get("/counsellor", authorize(["counsellor"]), dashboardController.getCounsellorDashboard);
router.get("/client", authorize(["client"]), dashboardController.getClientDashboard);

export default router;
