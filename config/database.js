import sequelize from "./sequelize.js";

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected successfully");
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
