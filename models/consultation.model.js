import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Consultation = sequelize.define(
    "Consultation",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        clientId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
            comment: "Null if not yet registered",
        },
        counsellorId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        lawyerId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        caseId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "cases",
                key: "id",
            },
        },
        // Consultation Details
        type: {
            type: DataTypes.ENUM("in_person", "video", "phone"),
            allowNull: false,
            defaultValue: "in_person",
        },
        status: {
            type: DataTypes.ENUM(
                "pending",
                "confirmed",
                "completed",
                "cancelled",
                "rescheduled"
            ),
            allowNull: false,
            defaultValue: "pending",
        },
        scheduledDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 60,
            comment: "Duration in minutes",
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 400.0,
        },
        // Contact Information (for non-registered users)
        clientName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        clientEmail: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        clientPhone: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        // Additional
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "Client's initial notes",
        },
        outcomeNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: "Counsellor/Lawyer notes after consultation",
        },
    },
    {
        tableName: "consultations",
        underscored: false,
        timestamps: true,
    }
);

export default Consultation;
