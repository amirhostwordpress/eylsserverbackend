import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Setting = sequelize.define(
    "Setting",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "e.g., twilio, email, general",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        updatedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
    },
    {
        tableName: "settings",
        underscored: false,
        timestamps: true,
    }
);

export default Setting;
