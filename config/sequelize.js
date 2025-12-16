// config/sequelize.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MYSQL_URL) {
  throw new Error("❌ MYSQL_URL is not defined in environment variables");
}

const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: "mysql",
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
  timezone: "+05:30",
});

export default sequelize;
