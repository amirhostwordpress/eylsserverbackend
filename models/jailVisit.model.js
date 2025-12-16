import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const JailVisit = sequelize.define(
    'JailVisit',
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
        accusedName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        jailId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'jails',
                key: 'id',
            },
        },
        emirate: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Copied from jail for filtering',
        },
        counselorId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        requestedDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        requestedTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'more_info_needed'),
            allowNull: false,
            defaultValue: 'pending',
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
    },
    {
        tableName: 'jail_visits',
        underscored: false,
        timestamps: true,
    }
);

export default JailVisit;
