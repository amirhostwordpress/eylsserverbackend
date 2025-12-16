// Authorization Middleware - Role-based access control
import { USER_ROLES } from "../utils/constants.js";

/**
 * Middleware to check if user has required role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 */
export const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required.",
            });
        }

        // Check if user role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You do not have permission to access this resource.",
                requiredRoles: allowedRoles,
                yourRole: req.user.role,
            });
        }

        next();
    };
};

/**
 * Middleware to check if user is super admin
 */
export const isSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== USER_ROLES.SUPER_ADMIN) {
        return res.status(403).json({
            success: false,
            message: "Super Admin access required.",
        });
    }
    next();
};

/**
 * Middleware to check if user is coordinator
 */
export const isCoordinator = (req, res, next) => {
    if (
        !req.user ||
        ![USER_ROLES.SUPER_ADMIN, USER_ROLES.COORDINATOR].includes(req.user.role)
    ) {
        return res.status(403).json({
            success: false,
            message: "Coordinator access required.",
        });
    }
    next();
};

/**
 * Middleware to check if user is staff (not client)
 */
export const isStaff = (req, res, next) => {
    const staffRoles = [
        USER_ROLES.SUPER_ADMIN,
        USER_ROLES.COORDINATOR,
        USER_ROLES.COUNSELLOR,
        USER_ROLES.LAWYER,
    ];

    if (!req.user || !staffRoles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Staff access required.",
        });
    }
    next();
};

/**
 * Middleware to check if user can access their own resource or is admin
 */
export const isSelfOrAdmin = (req, res, next) => {
    const resourceUserId = req.params.id || req.params.userId;

    if (
        req.user.role === USER_ROLES.SUPER_ADMIN ||
        req.userId === resourceUserId
    ) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "You can only access your own resources.",
    });
};

export default {
    authorize,
    isSuperAdmin,
    isCoordinator,
    isStaff,
    isSelfOrAdmin,
};
