// Emirate Access Control Middleware
import { hasEmirateAccess } from "../utils/helpers.js";
import { USER_ROLES } from "../utils/constants.js";

/**
 * Middleware to filter cases by user's assigned emirates
 * Adds emirate filter to query for coordinators/counsellors
 */
export const filterByEmirates = (req, res, next) => {
    if (!req.user) {
        return next();
    }

    // Super admin can see all emirates
    if (req.user.role === USER_ROLES.SUPER_ADMIN) {
        req.emirateFilter = null; // No filter
        return next();
    }

    // Lawyers and clients don't have emirate restrictions
    if (
        req.user.role === USER_ROLES.LAWYER ||
        req.user.role === USER_ROLES.CLIENT
    ) {
        req.emirateFilter = null;
        return next();
    }

    // Coordinators and Counsellors have emirate restrictions
    if (
        req.user.role === USER_ROLES.COORDINATOR ||
        req.user.role === USER_ROLES.COUNSELLOR
    ) {
        let assignedEmirates = req.user.assignedEmirates;

        // Handle stringified JSON
        if (typeof assignedEmirates === 'string') {
            try {
                assignedEmirates = JSON.parse(assignedEmirates);
            } catch (e) {
                assignedEmirates = [];
            }
        }

        if (!assignedEmirates || !Array.isArray(assignedEmirates) || assignedEmirates.length === 0) {
            // No emirates assigned - can't see anything
            req.emirateFilter = ["__NONE__"]; // Impossible emirate value
            return next();
        }

        req.emirateFilter = assignedEmirates;
        return next();
    }

    next();
};

/**
 * Middleware to check if user can access a specific emirate
 * Used when creating/updating cases
 */
export const checkEmirateAccess = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required.",
        });
    }

    // Get emirate from request body or params
    const emirate = req.body.emirate || req.params.emirate;

    if (!emirate) {
        return res.status(400).json({
            success: false,
            message: "Emirate is required.",
        });
    }

    // Check access
    if (!hasEmirateAccess(req.user, emirate)) {
        return res.status(403).json({
            success: false,
            message: `You do not have access to ${emirate}.`,
            yourEmirates: req.user.assignedEmirates || [],
        });
    }

    next();
};

export default {
    filterByEmirates,
    checkEmirateAccess,
};
