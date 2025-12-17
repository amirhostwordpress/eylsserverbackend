import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // local only, Railway ignores .env

if (!process.env.MYSQL_URL) {
  console.error("❌ MYSQL_URL not found");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.MYSQL_URL, {
  dialect: "mysql",
  logging: false,
});

export default sequelize;
