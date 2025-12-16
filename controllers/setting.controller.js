// Setting Controller - Simplified
import Setting from "../models/setting.model.js";

export const getAllSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();

        res.json({
            success: true,
            data: { settings },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch settings",
            error: error.message,
        });
    }
};

export const getSetting = async (req, res) => {
    try {
        const { key } = req.params;

        const setting = await Setting.findOne({ where: { key } });

        if (!setting) {
            return res.status(404).json({
                success: false,
                message: "Setting not found",
            });
        }

        res.json({
            success: true,
            data: { setting },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch setting",
            error: error.message,
        });
    }
};

export const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        let setting = await Setting.findOne({ where: { key } });

        if (!setting) {
            setting = await Setting.create({
                key,
                value,
                updatedBy: req.userId,
            });
        } else {
            setting.value = value;
            setting.updatedBy = req.userId;
            await setting.save();
        }

        res.json({
            success: true,
            message: "Setting updated successfully",
            data: { setting },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update setting",
            error: error.message,
        });
    }
};

export default {
    getAllSettings,
    getSetting,
    updateSetting,
};
