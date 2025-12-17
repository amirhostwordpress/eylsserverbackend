import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // works locally, ignored on Railway

const sequelize = new Sequelize(
  process.env.MYSQL_URL, // Railway provides this
  {
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
