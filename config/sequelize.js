import "dotenv/config";
import { Sequelize } from "sequelize";

const connectionUrl =
  process.env.MYSQL_PUBLIC_URL ||
  process.env.MYSQL_URL ||
  process.env.DATABASE_URL ||
  process.env.JAWSDB_URL;

const sequelize = connectionUrl
  ? new Sequelize(connectionUrl, {
      dialect: "mysql",
      logging: false,
      dialectOptions: {
        connectTimeout: 60000,
      },
    })
  : new Sequelize(
      process.env.MYSQL_DATABASE,
      process.env.MYSQL_USER,
      process.env.MYSQL_PASSWORD,
      {
        host: process.env.MYSQL_HOST || "localhost",
        port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
        dialect: "mysql",
        logging: false,
        dialectOptions: {
          connectTimeout: 60000,
        },
      }
    );

if (!connectionUrl && !process.env.MYSQL_DATABASE) {
  throw new Error(
    "Missing database configuration. Set MYSQL_PUBLIC_URL (or MYSQL_URL/DATABASE_URL) or set MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST."
  );
}

export default sequelize;
