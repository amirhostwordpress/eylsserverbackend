import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const CourtQuotation = sequelize.define(
    'CourtQuotation',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        caseNumber: {
            type: DataTypes.STRING(100),
            allowNull: false,
            references: {
                model: 'cases',
                key: 'caseNumber',
            },
        },
        emirate: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        court: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Name of the court',
        },
        clientName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        clientContact: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        feeAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        approvedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        approvedDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        attachments: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Array of document references',
        },
    },
    {
        tableName: 'court_quotations',
        underscored: false,
        timestamps: true,
    }
);

export default CourtQuotation;
