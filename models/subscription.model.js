import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("subscribed", "unsubscribed"),
      allowNull: false,
      defaultValue: "subscribed",
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "subscriptions",
    underscored: false,
  }
);

export default Subscription;
