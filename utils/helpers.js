// Helper utility functions
import { CASE_NUMBER_PREFIX, INVOICE_NUMBER_PREFIX } from "./constants.js";

/**
 * Generate unique case number
 * Format: CASE-YYYY-XXXX
 */
export const generateCaseNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `${CASE_NUMBER_PREFIX}-${year}-${random}`;
};

/**
 * Generate unique invoice number
 * Format: INV-YYYY-XXXX
 */
export const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `${INVOICE_NUMBER_PREFIX}-${year}-${random}`;
};

/**
 * Generate unique client number
 * Format: CL-YYYY-XXXX
 * Note: Checks for uniqueness in application since DB has index limit
 */
export const generateClientNumber = async (User) => {
    const year = new Date().getFullYear();
    const { Op } = await import("sequelize");
    
    // Try to generate unique number, retry if duplicate found
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
        // Get the count of clients with clientNumber this year
        const count = await User.count({
            where: {
                role: 'client',
                clientNumber: {
                    [Op.like]: `CL-${year}-%`
                }
            }
        });
        
        // Increment count for new client
        const sequence = (count + 1 + attempts).toString().padStart(4, "0");
        const clientNumber = `CL-${year}-${sequence}`;
        
        // Check if this number already exists
        const existing = await User.findOne({
            where: { clientNumber }
        });
        
        if (!existing) {
            return clientNumber;
        }
        
        attempts++;
    }
    
    // Fallback: use timestamp if all attempts failed
    const timestamp = Date.now().toString().slice(-4);
    return `CL-${year}-${timestamp}`;
};

/**
 * Format phone number to international format (UAE +971)
 */
export const formatPhoneNumber = (phone) => {
    // Remove all non‑numeric characters
    const cleaned = phone.replace(/\D/g, "");

    // Already includes country code
    if (cleaned.startsWith("971")) {
        return `+${cleaned}`;
    }

    // Starts with a leading zero – replace with country code
    if (cleaned.startsWith("0")) {
        return `+971${cleaned.substring(1)}`;
    }

    // Fallback – prepend country code
    return `+971${cleaned}`;
};

/**
 * Check if a user has access to a specific emirate
 */
export const hasEmirateAccess = (user, emirate) => {
    // Super admin can access everything
    if (user.role === "super_admin") return true;

    // Lawyers and clients are unrestricted
    if (user.role === "lawyer" || user.role === "client") return true;

    // Coordinators / counsellors – must have an assignedEmirates array
    let assignedEmirates = user.assignedEmirates;

    // Handle stringified JSON
    if (typeof assignedEmirates === 'string') {
        try {
            assignedEmirates = JSON.parse(assignedEmirates);
        } catch (e) {
            return false;
        }
    }

    if (!Array.isArray(assignedEmirates)) return false;

    // Normalize for case-insensitive comparison
    const normalizedAssigned = assignedEmirates.map(e => typeof e === 'string' ? e.trim().toLowerCase() : String(e).toLowerCase());
    const normalizedEmirate = typeof emirate === 'string' ? emirate.trim().toLowerCase() : String(emirate).toLowerCase();

    return normalizedAssigned.includes(normalizedEmirate);
};

/**
 * Pagination helper – returns limit, offset and the current page number
 */
export const getPaginationParams = (page = 1, limit = 10) => {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    return { limit: limitNum, offset, page: pageNum };
};

/**
 * Sanitize a user object before sending it to the client (remove password, ensure assignedEmirates is an array when appropriate)
 */
export const sanitizeUser = (user) => {
    if (!user) return null;
    const userObj = typeof user.toJSON === "function" ? user.toJSON() : user;
    const { password, ...sanitized } = userObj;

    // For coordinator / counsellor ensure assignedEmirates is an array (default empty)
    if (sanitized.role === "coordinator" || sanitized.role === "counsellor") {
        if (typeof sanitized.assignedEmirates === 'string') {
            try {
                sanitized.assignedEmirates = JSON.parse(sanitized.assignedEmirates);
            } catch (e) {
                sanitized.assignedEmirates = [];
            }
        }

        if (!Array.isArray(sanitized.assignedEmirates)) {
            sanitized.assignedEmirates = [];
        }
    } else {
        // Other roles don't need this field – remove it for cleanliness
        delete sanitized.assignedEmirates;
    }

    return sanitized;
};

/**
 * Standardised API response format
 */
export const formatResponse = (success, message, data = null, meta = null) => {
    const response = { success, message };
    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;
    return response;
};

/**
 * Generate a random password (default length 12)
 */
export const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

export default {
    generateCaseNumber,
    generateInvoiceNumber,
    formatPhoneNumber,
    hasEmirateAccess,
    sanitizeUser,
    getPaginationParams,
    formatResponse,
    generateRandomPassword,
};
