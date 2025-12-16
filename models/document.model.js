import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Document = sequelize.define(
    "Document",
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
        uploadedBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        fileName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "Stored filename on FTP",
        },
        originalFileName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: "Original uploaded filename",
        },
        fileType: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: "MIME type or extension",
        },
        fileSize: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: "File size in bytes",
        },
        filePath: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: "Path on FTP server",
        },
        fileUrl: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: "Public accessible URL",
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: "Document category",
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: "documents",
        underscored: false,
        timestamps: true,
    }
);

export default Document;
