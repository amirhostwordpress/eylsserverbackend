import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const CaseTracking = sequelize.define(
    "CaseTracking",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        caseId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "cases",
                key: "id",
            },
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        changeNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "Auto-incremented per case",
        },
        changeType: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: "e.g., status_change, assignment, note_added",
        },
        oldValue: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        newValue: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        // Extended fields for Case Actions & Hearings
        nextHearing: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        reason: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        actionRequired: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dateOfActionRequired: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        workUndertaken: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        other: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        staffName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: "case_tracking",
        underscored: false,
        timestamps: true,
        updatedAt: false,
    }
);

export default CaseTracking;
