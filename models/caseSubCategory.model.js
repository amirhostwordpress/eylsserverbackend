import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const CaseSubCategory = sequelize.define(
    'CaseSubCategory',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Sub-category name under category',
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'case_categories',
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
        tableName: 'case_sub_categories',
        underscored: false,
        timestamps: true,
    }
);

export default CaseSubCategory;
