// Authentication Middleware
import { verifyToken } from "../config/jwt.js";
import User from "../models/user.model.js";

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Authorization denied.",
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = verifyToken(token);

        // Get user from database
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Authorization denied.",
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "User account is inactive.",
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;
        req.userRole = user.role;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);

        // If DB is unreachable, auth lookup (User.findByPk) will fail.
        // Return a clearer service-unavailable response instead of a generic auth error.
        const isDbConnectionError =
            error?.name === "SequelizeConnectionError" ||
            error?.name === "SequelizeHostNotFoundError" ||
            error?.name === "SequelizeAccessDeniedError" ||
            error?.original?.code === "ETIMEDOUT" ||
            error?.parent?.code === "ETIMEDOUT";

        if (isDbConnectionError) {
            return res.status(503).json({
                success: false,
                message: "Database connection error. Please try again later.",
            });
        }

        if (error.message.includes("token")) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Authentication error.",
            error: error.message,
        });
    }
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = verifyToken(token);
            const user = await User.findByPk(decoded.userId, {
                attributes: { exclude: ["password"] },
            });

            if (user && user.isActive) {
                req.user = user;
                req.userId = user.id;
                req.userRole = user.role;
            }
        }

        next();
    } catch (error) {
        // Don't fail on optional auth
        next();
    }
};

export default authMiddleware;
