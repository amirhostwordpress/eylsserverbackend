// config/database.js
import sequelize, { dbConfig } from "./sequelize.js";
import setupAssociations from "./associations.js";

const connectDB = async () => {
  try {
    // Log which DB config values are being used (hide password)
    // Values come from `config/sequelize.js` env resolution.

    await sequelize.authenticate();

    setupAssociations();

    console.log("Syncing database...");
    // Use default sync (create only missing tables) to avoid MySQL 64-key limit
    // If you need to alter tables, do it manually or use migrations
    await sequelize.sync({ force: false });
    console.log("Database synced.");

  } catch (error) {
    console.error(
      "❌ Database connection failed (app will continue without DB):",
      error.message
    );
    // Do NOT exit — allow app to start so API endpoints can be tested
  }
};

export { connectDB };
export default connectDB;
