import { DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    visiblePassword: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Plain text password for clients (requested feature)",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(
        "super_admin",
        "coordinator",
        "counsellor",
        "lawyer",
        "client"
      ),
      allowNull: false,
      defaultValue: "client",
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    assignedEmirates: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: "Array of emirates for coordinators/counsellors",
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    caseNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "For clients linked to a specific case",
    },
    clientNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      // unique: true, // Commented out due to MySQL 64 index limit - handled in application
      comment: "Unique client reference number (e.g., CL-2024-001)",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginIp: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    twoFactorSecret: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    twoFactorConfirmedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    twoFactorFailedAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    twoFactorLockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Extended client fields for bulk import
    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emiratesId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    whatsappNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    landlineNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    companyAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    companyEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    companyPhone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    occupation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    employerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specializations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: "Array of case type IDs for lawyer specializations",
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: null,
      comment: "Granular permissions for coordinators - object with section access flags",
    },
  },
  {
    tableName: "users",
    underscored: false,
    timestamps: true,
  }
);

export default User;
