import express from "express";
import messageController from "../controllers/message.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { authorize, isSuperAdmin } from "../middleware/authorize.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Client and Super Admin can create messages (clients send, admins can also send)
router.post("/", messageController.createMessage);

// Get all messages (filtered by role)
router.get("/", messageController.getAllMessages);

// Get unread count
router.get("/unread-count", messageController.getUnreadCount);

// Get message by ID
router.get("/:id", messageController.getMessageById);

// Super Admin only routes
router.post("/:id/reply", isSuperAdmin, messageController.replyToMessage);
router.put("/:id/status", isSuperAdmin, messageController.updateMessageStatus);
router.delete("/:id", isSuperAdmin, messageController.deleteMessage);

export default router;
