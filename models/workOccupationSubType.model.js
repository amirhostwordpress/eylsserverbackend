import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const WorkOccupationSubType = sequelize.define(
    'WorkOccupationSubType',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Sub-type name, e.g., Housemaid, Nanny, Cook, Driver',
        },
        occupationTypeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'work_occupation_types',
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
        tableName: 'work_occupation_sub_types',
        underscored: false,
        timestamps: true,
    }
);

export default WorkOccupationSubType;
