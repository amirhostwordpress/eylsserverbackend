import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Payment = sequelize.define(
    "Payment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        caseId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "cases",
                key: "id",
            },
        },
        clientId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        consultationId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "consultations",
                key: "id",
            },
        },
        // Payment Details
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "AED",
        },
        paymentMethod: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: "card, bank_transfer, cash, etc.",
        },
        status: {
            type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
            allowNull: false,
            defaultValue: "pending",
        },
        // Gateway Information
        transactionId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "Payment gateway transaction ID",
        },
        gatewayResponse: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: "Full gateway response for debugging",
        },
        // Invoice
        invoiceNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
        },
        invoiceDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // Additional
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "payments",
        underscored: false,
        timestamps: true,
    }
);

export default Payment;
