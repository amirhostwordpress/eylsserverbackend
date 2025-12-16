import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const CaseType = sequelize.define(
    'CaseType',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            comment: 'Case type name, e.g., LABOR CASE, CRIMINAL CASE',
        },
        code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Unique code for the case type, e.g., 21, 22',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Soft delete flag',
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        tableName: 'case_types',
        underscored: false,
        timestamps: true,
    }
);

export default CaseType;
