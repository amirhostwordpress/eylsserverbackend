import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const CaseCategory = sequelize.define(
    'CaseCategory',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Category name under case type',
        },
        caseTypeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'case_types',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Soft delete flag',
        },
    },
    {
        tableName: 'case_categories',
        underscored: false,
        timestamps: true,
    }
);

export default CaseCategory;
