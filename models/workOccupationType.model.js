import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const WorkOccupationType = sequelize.define(
    'WorkOccupationType',
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
            comment: 'Occupation type name, e.g., Domestic Worker, Construction Worker',
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
        tableName: 'work_occupation_types',
        underscored: false,
        timestamps: true,
    }
);

export default WorkOccupationType;
