import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Jail = sequelize.define(
    'Jail',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Jail facility name',
        },
        policeStationId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'police_stations',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        emirate: {
            type: DataTypes.ENUM(
                'Abu Dhabi',
                'Al Ain',
                'Dubai',
                'Sharjah',
                'Ajman',
                'Ras Al Khaimah',
                'Umm Al Quwain',
                'Fujairah',
                'Others'
            ),
            allowNull: false,
            comment: 'Auto-filled from police station',
        },
        jailType: {
            type: DataTypes.ENUM('Men', 'Women', 'Youth', 'Mixed'),
            allowNull: false,
            defaultValue: 'Men',
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: 'jails',
        underscored: false,
        timestamps: true,
    }
);

export default Jail;
