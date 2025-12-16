import CaseInquiry from "../models/caseInquiry.model.js";
import ftpService from "../utils/ftpService.js";
import fs from "fs";

export const createInquiry = async (req, res) => {
    try {
        const files = req.files || [];
        const documents = [];

        // Upload files to FTP and collect document info
        for (const file of files) {
            try {
                // Upload to root of FTP sub-account (which is /eylsuploads)
                const remotePath = file.filename;

                // Upload to FTP
                const fileUrl = await ftpService.uploadFile(file.path, remotePath);

                documents.push({
                    name: file.originalname,
                    path: fileUrl, // Store FTP URL instead of local path
                    filename: file.filename,
                    mimetype: file.mimetype,
                    size: file.size
                });

                // Delete local file after successful FTP upload
                fs.unlinkSync(file.path);
            } catch (uploadError) {
                console.error(`Failed to upload file ${file.originalname}:`, uploadError);
                // Continue with other files even if one fails
            }
        }

        const inquiry = await CaseInquiry.create({
            ...req.body,
            documents: documents,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: "Case inquiry submitted successfully",
            data: { inquiry }
        });
    } catch (error) {
        console.error("Create inquiry error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit inquiry",
            error: error.message
        });
    }
};

export const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await CaseInquiry.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: { inquiries }
        });
    } catch (error) {
        console.error("Get inquiries error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch inquiries",
            error: error.message
        });
    }
};

export const updateInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const inquiry = await CaseInquiry.findByPk(id);
        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }

        if (status) inquiry.status = status;
        if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;

        await inquiry.save();

        res.json({
            success: true,
            message: "Inquiry updated successfully",
            data: { inquiry }
        });
    } catch (error) {
        console.error("Update inquiry error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update inquiry",
            error: error.message
        });
    }
};

export const deleteInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const inquiry = await CaseInquiry.findByPk(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found"
            });
        }

        await inquiry.destroy();

        res.json({
            success: true,
            message: "Inquiry deleted successfully"
        });
    } catch (error) {
        console.error("Delete inquiry error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete inquiry",
            error: error.message
        });
    }
};

export default {
    createInquiry,
    getAllInquiries,
    updateInquiryStatus,
    deleteInquiry
};
