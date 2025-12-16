import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const CaseInquiry = sequelize.define(
    "CaseInquiry",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        emiratesId: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        caseType: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        urgency: {
            type: DataTypes.ENUM("low", "medium", "high", "urgent"),
            allowNull: false,
            defaultValue: "medium",
        },
        documents: {
            type: DataTypes.JSON, // Array of file URLs/paths
            allowNull: true,
            defaultValue: [],
        },
        consultationPreference: {
            type: DataTypes.ENUM("office", "video", "phone"),
            allowNull: false,
            defaultValue: "office",
        },
        preferredDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("pending", "reviewed", "converted", "rejected"),
            allowNull: false,
            defaultValue: "pending",
        },
        adminNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "case_inquiries",
        underscored: false,
        timestamps: true,
    }
);

export default CaseInquiry;
