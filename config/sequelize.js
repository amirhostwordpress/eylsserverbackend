// config/sequelize.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config({ override: true });

// Support both local and remote database configurations.
// Local settings (DB_USER, DB_PASS, DB_NAME, DB_HOST) take priority if set.
// Falls back to remote credentials (DB_Username, DB_Password, DB_Database, etc.) if local not present.
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

const parseConnectionUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return {
      database: url.pathname?.replace(/^\//, ""),
      user: decodeURIComponent(url.username || ""),
      password: decodeURIComponent(url.password || ""),
      host: url.hostname,
      port: url.port ? Number(url.port) : undefined,
    };
  } catch {
    return null;
  }
};

const parsedUrl = connectionUrl ? parseConnectionUrl(connectionUrl) : null;

const DB_NAME =
  process.env.DB_NAME ||
  process.env.DB_Database ||
  parsedUrl?.database ||
  "u929535174_elsy";

const DB_USER =
  process.env.DB_USER ||
  process.env.DB_Username ||
  parsedUrl?.user ||
  "u929535174_sara";

const DB_PASSWORD =
  process.env.DB_PASS ||
  process.env.DB_Password ||
  parsedUrl?.password ||
  "FaithforLove@123321";
const DB_HOST =
  process.env.DB_HOST || // Local/Remote (localhost or srv909.hstgr.io)
  process.env.Host ||
  process.env.host ||
  parsedUrl?.host ||
  "srv909.hstgr.io";
const DB_PORT = Number(
  process.env.DB_PORT || // Explicit DB port
  process.env.DBPORT || // Alt naming
    parsedUrl?.port ||
  3306 // Default MySQL port
);

export const dbConfig = {
  database: DB_NAME,
  user: DB_USER,
  host: DB_HOST,
  port: DB_PORT,
};

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "mysql",
  port: DB_PORT,
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
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
