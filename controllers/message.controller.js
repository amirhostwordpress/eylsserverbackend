import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Case from "../models/case.model.js";
import { Op } from "sequelize";

/**
 * Create a new message (Client only)
 */
export const createMessage = async (req, res) => {
    try {
        const { subject, message, priority } = req.body;
        const clientId = req.userId;

        // Validate required fields
        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Subject and message are required",
            });
        }

        // Create message
        const newMessage = await Message.create({
            clientId,
            subject,
            message,
            priority: priority || "medium",
            status: "pending",
            isRead: false,
            clientRead: true, // Client has read their own message
        });

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: { message: newMessage },
        });
    } catch (error) {
        console.error("Create message error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
            error: error.message,
        });
    }
};

/**
 * Get all messages (Super Admin sees all, Client sees only their own)
 */
export const getAllMessages = async (req, res) => {
    try {
        const { status, priority, search } = req.query;
        const where = {};

        // If client, only show their messages
        if (req.user.role === "client") {
            where.clientId = req.userId;
        }

        // Apply filters
        if (status) where.status = status;
        if (priority) where.priority = priority;

        if (search) {
            where[Op.or] = [
                { subject: { [Op.like]: `%${search}%` } },
                { message: { [Op.like]: `%${search}%` } },
            ];
        }

        const messages = await Message.findAll({
            where,
            include: [
                {
                    model: User,
                    as: "client",
                    attributes: ["id", "name", "email", "phone", "clientNumber"],
                    include: [
                        {
                            model: Case,
                            as: "clientCases",
                            attributes: ["caseNumber", "caseType", "status", "registrationDate"],
                            limit: 5,
                            order: [["createdAt", "DESC"]],
                        }
                    ]
                },
                {
                    model: User,
                    as: "replier",
                    attributes: ["id", "name", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        // Format the response to include cases in a cleaner structure
        const formattedMessages = messages.map(msg => {
            const msgData = msg.toJSON();
            return {
                ...msgData,
                client: {
                    ...msgData.client,
                    cases: msgData.client.clientCases || []
                }
            };
        });

        res.json({
            success: true,
            data: { messages: formattedMessages },
        });
    } catch (error) {
        console.error("Get messages error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
            error: error.message,
        });
    }
};

/**
 * Get message by ID
 */
export const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "client",
                    attributes: ["id", "name", "email", "phone", "clientNumber"],
                    include: [
                        {
                            model: Case,
                            as: "clientCases",
                            attributes: ["caseNumber", "caseType", "status", "registrationDate"],
                            limit: 5,
                            order: [["createdAt", "DESC"]],
                        }
                    ]
                },
                {
                    model: User,
                    as: "replier",
                    attributes: ["id", "name", "email"],
                },
            ],
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        // Check access permission
        if (req.user.role === "client" && message.clientId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Mark as read
        if (req.user.role === "super_admin" && !message.isRead) {
            message.isRead = true;
            await message.save();
        } else if (req.user.role === "client" && message.adminReply && !message.clientRead) {
            message.clientRead = true;
            await message.save();
        }

        // Format the response to include cases in a cleaner structure
        const msgData = message.toJSON();
        const formattedMessage = {
            ...msgData,
            client: {
                ...msgData.client,
                cases: msgData.client.clientCases || []
            }
        };

        res.json({
            success: true,
            data: { message: formattedMessage },
        });
    } catch (error) {
        console.error("Get message error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch message",
            error: error.message,
        });
    }
};

/**
 * Reply to a message (Super Admin only)
 */
export const replyToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminReply } = req.body;

        if (!adminReply) {
            return res.status(400).json({
                success: false,
                message: "Reply message is required",
            });
        }

        const message = await Message.findByPk(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        // Update message with reply
        message.adminReply = adminReply;
        message.repliedBy = req.userId;
        message.repliedAt = new Date();
        message.status = "replied";
        message.clientRead = false; // Client hasn't read the reply yet

        await message.save();

        // Fetch updated message with associations
        const updatedMessage = await Message.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "client",
                    attributes: ["id", "name", "email", "phone"],
                },
                {
                    model: User,
                    as: "replier",
                    attributes: ["id", "name", "email"],
                },
            ],
        });

        res.json({
            success: true,
            message: "Reply sent successfully",
            data: { message: updatedMessage },
        });
    } catch (error) {
        console.error("Reply to message error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send reply",
            error: error.message,
        });
    }
};

/**
 * Update message status (Super Admin only)
 */
export const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "replied", "closed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        const message = await Message.findByPk(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        message.status = status;
        await message.save();

        res.json({
            success: true,
            message: "Message status updated",
            data: { message },
        });
    } catch (error) {
        console.error("Update message status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update message status",
            error: error.message,
        });
    }
};

/**
 * Delete message (Super Admin only)
 */
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Message.findByPk(id);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: "Message not found",
            });
        }

        await message.destroy();

        res.json({
            success: true,
            message: "Message deleted successfully",
        });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete message",
            error: error.message,
        });
    }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (req, res) => {
    try {
        let where = {};

        if (req.user.role === "super_admin") {
            // Count unread messages from clients
            where.isRead = false;
        } else if (req.user.role === "client") {
            // Count unread replies for this client
            where.clientId = req.userId;
            where.clientRead = false;
            where.adminReply = { [Op.ne]: null };
        }

        const count = await Message.count({ where });

        res.json({
            success: true,
            data: { unreadCount: count },
        });
    } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get unread count",
            error: error.message,
        });
    }
};

export default {
    createMessage,
    getAllMessages,
    getMessageById,
    replyToMessage,
    updateMessageStatus,
    deleteMessage,
    getUnreadCount,
};
