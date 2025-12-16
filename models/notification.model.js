import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Notification = sequelize.define(
    "Notification",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        type: {
            type: DataTypes.ENUM("sms", "whatsapp", "email"),
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "sent", "failed"),
            allowNull: false,
            defaultValue: "pending",
        },
        sentAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        errorMessage: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: "Additional data like case ID, consultation ID, etc.",
        },
    },
    {
        tableName: "notifications",
        underscored: false,
        timestamps: true,
        updatedAt: false,
    }
);

export default Notification;
