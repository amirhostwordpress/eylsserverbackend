// config/sequelize.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ override: true });

const DB_NAME =
  process.env.DB_NAME ||
  process.env.DB_Database ||
  process.env.MYSQLDATABASE;

const DB_USER =
  process.env.DB_USER ||
  process.env.DB_Username ||
  process.env.MYSQLUSER;

const DB_PASSWORD =
  process.env.DB_PASS ||
  process.env.DB_Password ||
  process.env.MYSQLPASSWORD;

const DB_HOST =
  process.env.DB_HOST ||
  process.env.Host ||
  process.env.host ||
  process.env.MYSQLHOST;

const DB_PORT = Number(
  process.env.DB_PORT ||
  process.env.DBPORT ||
  process.env.MYSQLPORT ||
  3306
);

if (!DB_NAME || !DB_USER || !DB_PASSWORD || !DB_HOST) {
  throw new Error("❌ Database environment variables are missing");
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "mysql",
  logging: false,

  define: {
    timestamps: true,
  },

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
sequelize.authenticate()
  .then(() => console.log("✅ DB Connected"))
  .catch(err => console.error("❌ DB Error:", err));
