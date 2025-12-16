import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const PoliceStation = sequelize.define(
    'PoliceStation',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Police station name',
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
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        contactNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        officerInCharge: {
            type: DataTypes.STRING(255),
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
        tableName: 'police_stations',
        underscored: false,
        timestamps: true,
    }
);

export default PoliceStation;
