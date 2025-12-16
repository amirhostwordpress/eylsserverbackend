// File Upload Middleware
import multer from "multer";
import path from "path";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "../utils/constants.js";
import fs from "fs";

// Create uploads directories if they don't exist
const uploadDir = "./uploads";
const casesUploadDir = "./uploads/cases";

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(casesUploadDir)) {
    fs.mkdirSync(casesUploadDir, { recursive: true });
}

// Configure multer storage for general uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename: remove spaces and special characters
        const sanitized = file.originalname
            .replace(/\s+/g, '_')  // Replace spaces with underscores
            .replace(/[^a-zA-Z0-9._-]/g, ''); // Remove special characters except . _ -
        cb(null, sanitized);
    },
});

// Configure multer storage for case-related uploads
const caseStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, casesUploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename: remove spaces and special characters
        const sanitized = file.originalname
            .replace(/\s+/g, '_')  // Replace spaces with underscores
            .replace(/[^a-zA-Z0-9._-]/g, ''); // Remove special characters except . _ -
        cb(null, sanitized);
    },
});

// File filter
const fileFilter = (req, file, cb) => {
    // Check file type
    if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`
            ),
            false
        );
    }
};

// Configure multer for general uploads
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

// Configure multer for case-related uploads
const caseUpload = multer({
    storage: caseStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});

// Middleware for single file upload (general)
export const uploadSingle = upload.single("file");

// Middleware for multiple file upload (general)
export const uploadMultiple = upload.array("files", 10);

// Middleware for case document uploads
export const uploadCaseDocuments = caseUpload.array("documents", 10);

// Error handling middleware for multer
export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    next();
};

export { upload, caseUpload };
export default {
    upload,
    caseUpload,
    uploadSingle,
    uploadMultiple,
    uploadCaseDocuments,
    handleUploadError,
};
