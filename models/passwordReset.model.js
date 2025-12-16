import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const PasswordReset = sequelize.define(
    'PasswordReset',
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
                model: 'users',
                key: 'id',
            },
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
        },
        requestDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: '24 hours from request date',
        },
        rejectionReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'password_resets',
        underscored: false,
        timestamps: true,
    }
);

export default PasswordReset;
