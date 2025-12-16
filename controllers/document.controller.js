// Document Controller
import Document from "../models/document.model.js";
import Case from "../models/case.model.js";
import User from "../models/user.model.js";
import ftpService from "../utils/ftpService.js";
import fs from "fs";
import path from "path";

/**
 * Upload document
 */
export const uploadDocument = async (req, res) => {
    try {
        const { caseId, category, description } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        // Verify case exists
        const caseData = await Case.findByPk(caseId);
        if (!caseData) {
            return res.status(404).json({
                success: false,
                message: "Case not found",
            });
        }

        // Upload to FTP
        const localPath = req.file.path;
        const remotePath = req.file.filename; // Upload to root of FTP sub-account

        const fileUrl = await ftpService.uploadFile(localPath, remotePath);

        // Create document record
        const document = await Document.create({
            caseId,
            uploadedBy: req.userId,
            fileName: req.file.filename,
            originalFileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            filePath: remotePath,
            fileUrl,
            category: category || "general",
            description,
        });

        // Delete local file
        fs.unlinkSync(localPath);

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            data: { document },
        });
    } catch (error) {
        console.error("Upload document error:", error);
        res.status(500).json({
            success: false,
            message: "Failedto upload document",
            error: error.message,
        });
    }
};

/**
 * Get documents by case
 */
export const getDocumentsByCase = async (req, res) => {
    try {
        const { caseId } = req.params;

        const documents = await Document.findAll({
            where: { caseId },
            include: [
                { model: User, as: "uploader", attributes: ["name", "role"] },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json({
            success: true,
            data: { documents },
        });
    } catch (error) {
        console.error("Get documents error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch documents",
            error: error.message,
        });
    }
};

/**
 * Delete document
 */
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await Document.findByPk(id);
        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found",
            });
        }

        // Delete from FTP (optional, can keep files)
        // await ftpService.deleteFile(document.filePath);

        await document.destroy();

        res.json({
            success: true,
            message: "Document deleted successfully",
        });
    } catch (error) {
        console.error("Delete document error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete document",
            error: error.message,
        });
    }
};

export default {
    uploadDocument,
    getDocumentsByCase,
    deleteDocument,
};
