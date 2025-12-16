import sequelize from "../config/sequelize.js";

/**
 * Migration to create messages table
 */
const createMessagesTable = async () => {
  try {
    console.log("Starting migration: Create messages table...");

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        clientId VARCHAR(36) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('pending', 'replied', 'closed') NOT NULL DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
        adminReply TEXT NULL,
        repliedBy VARCHAR(36) NULL,
        repliedAt DATETIME NULL,
        isRead BOOLEAN NOT NULL DEFAULT FALSE,
        clientRead BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (clientId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (repliedBy) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_clientId (clientId),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_isRead (isRead)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Migration completed: messages table created successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  }
};

// Run migration
createMessagesTable()
  .then(() => {
    console.log("Migration finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
