// Error Handler Middleware
/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error("Error:", err);

    // Sequelize validation error
    if (err.name === "SequelizeValidationError") {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: err.errors.map((e) => ({
                field: e.path,
                message: e.message,
            })),
        });
    }

    // Sequelize unique constraint error
    if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            success: false,
            message: "Resource already exists",
            field: err.errors[0]?.path,
        });
    }

    // Sequelize foreign key constraint error
    if (err.name === "SequelizeForeignKeyConstraintError") {
        return res.status(400).json({
            success: false,
            message: "Invalid reference. Related resource not found.",
        });
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }

    if (err.name === "TokenExpiredError") {
        return res.status(401).json({
            success: false,
            message: "Token expired",
        });
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};

export default {
    errorHandler,
    notFoundHandler,
};
