// Input Validation Middleware
import { validationResult } from "express-validator";

/**
 * Middleware to validate request data using express-validator
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array().map((err) => ({
                field: err.path || err.param,
                message: err.msg,
                value: err.value,
            })),
        });
    }

    next();
};

export default validate;
