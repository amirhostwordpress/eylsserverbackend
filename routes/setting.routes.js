// Setting Routes
import express from "express";
import settingController from "../controllers/setting.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { isSuperAdmin } from "../middleware/authorize.middleware.js";

const router = express.Router();

// All routes require authentication and Super Admin access
router.use(authMiddleware, isSuperAdmin);

router.get("/", settingController.getAllSettings);
router.get("/:key", settingController.getSetting);
router.put("/:key", settingController.updateSetting);

export default router;
