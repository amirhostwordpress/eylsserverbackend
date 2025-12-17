// config/sequelize.js
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ override: true });

let sequelize;

if (process.env.MYSQL_URL) {
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
    process.env.MYSQLUSER,
    process.env.MYSQLPASSWORD,
    {
      host: process.env.MYSQLHOST || "localhost",
      port: process.env.MYSQLPORT || 3306,
      dialect: "mysql",
      logging: false,
    }
  );
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully");
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    process.exit(1);
  }
};

export default sequelize;
