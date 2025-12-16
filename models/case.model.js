import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Case = sequelize.define(
    "Case",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        caseNumber: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        clientId: {
            type: DataTypes.UUID,
            allowNull: false,
            // FK removed - relationship managed by Sequelize associations
        },
        coordinatorId: {
            type: DataTypes.UUID,
            allowNull: false,
            // FK removed - relationship managed by Sequelize associations
        },
        counsellorId: {
            type: DataTypes.UUID,
            allowNull: true,
            // FK removed - relationship managed by Sequelize associations
        },
        lawyerId: {
            type: DataTypes.UUID,
            allowNull: true,
            // FK removed - relationship managed by Sequelize associations
        },
        // Client Information
        clientName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        clientEmail: {
            type: DataTypes.STRING(255),
            allowNull: true,  // Made nullable to reduce index count
        },
        clientPhone: {
            type: DataTypes.STRING(50),
            allowNull: true,  // Made nullable to reduce index count
        },
        emiratesId: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // Extended Personal & Contact details
        nationality: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        whatsappNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        landlineNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        // Company Details
        companyAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        companyNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        companyEmail: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        // Occupation & Work
        occupation: {
            type: DataTypes.JSON,  // To hold array of occupation sub-type IDs
            allowNull: true,
        },
        employerName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        employerNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        employerAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        salary: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        lastDayOfWork: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        stillOnDuty: {
            type: DataTypes.ENUM("yes", "no"),
            allowNull: true,
        },
        workPeriodStart: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        workPeriodEnd: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // Family & Friends info
        familyMemberName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        familyMemberNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        friendName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        friendNumber: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        // Case classification & referral
        caseType: {
            type: DataTypes.STRING(255),
            allowNull: true,  // Made nullable to reduce index count
        },
        caseCategory: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        caseSubCategory: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        emirate: {
            type: DataTypes.STRING(100),
            allowNull: true,  // Made nullable to reduce index count
        },
        courtArea: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        urgencyLevel: {
            type: DataTypes.ENUM("low", "medium", "high", "critical"),
            allowNull: false,
            defaultValue: "medium",
        },
        status: {
            type: DataTypes.ENUM(
                "pending",
                "active",
                "in_progress",
                "on_hold",
                "completed",
                "closed",
                "rejected"
            ),
            allowNull: false,
            defaultValue: "pending",
        },
        approvalStatus: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            allowNull: false,
            defaultValue: "pending",
        },
        registrationDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        hearingDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        nextHearingDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        closedDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // Financial
        estimatedCost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.0,
        },
        paidAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.0,
        },
        remainingAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.0,
        },
        // Additional
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        // Referral & metadata
        referenceSource: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        referenceOtherDetails: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        regionGroup: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        signature: {
            type: DataTypes.TEXT, // Base64 or signature image string
            allowNull: true,
        },
        // Jail Visit Details
        jailVisiting: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        dateOfEndorsement: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        jailName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        dateOfArrest: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        reportNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        dateOfVisiting: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "cases",
        underscored: false,
        timestamps: true,
    }
);

export default Case;
