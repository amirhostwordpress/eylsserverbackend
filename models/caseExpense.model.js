import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const CaseExpense = sequelize.define(
    "CaseExpense",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        caseId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "cases",
                key: "id",
            },
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        expense: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        tableName: "case_expenses",
        underscored: false,
        timestamps: true,
    }
);

export default CaseExpense;
