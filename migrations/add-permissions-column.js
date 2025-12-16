import sequelize from "../config/sequelize.js";

/**
 * Migration to add permissions column to users table
 */
const addPermissionsColumn = async () => {
  try {
    console.log("Starting migration: Add permissions column to users table...");

    // Add permissions column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS permissions JSON NULL 
      COMMENT 'Granular permissions for coordinators - object with section access flags'
    `);

    console.log("✅ Migration completed: permissions column added successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};

// Run migration
addPermissionsColumn()
  .then(() => {
    console.log("Migration finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
