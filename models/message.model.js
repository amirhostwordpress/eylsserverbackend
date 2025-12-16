import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Client who sent the message",
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "replied", "closed"),
      allowNull: false,
      defaultValue: "pending",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      allowNull: false,
      defaultValue: "medium",
    },
    adminReply: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Super admin's reply to the message",
    },
    repliedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Super admin who replied",
    },
    repliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether admin has read the message",
    },
    clientRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "Whether client has read the reply",
    },
  },
  {
    tableName: "messages",
    underscored: false,
    timestamps: true,
  }
);

export default Message;
