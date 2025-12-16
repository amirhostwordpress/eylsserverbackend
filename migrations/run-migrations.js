import sequelize from "../config/sequelize.js";

/**
 * Run all pending migrations
 */
const runMigrations = async () => {
  try {
    console.log("=== Starting Database Migrations ===\n");

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    // Migration 1: Add permissions column to users table
    console.log("Migration 1: Adding permissions column to users table...");
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN permissions JSON NULL 
        COMMENT 'Granular permissions for coordinators - object with section access flags'
      `);
      console.log("✅ Permissions column added successfully\n");
    } catch (error) {
      if (error.message.includes("Duplicate column name")) {
        console.log("⚠️  Permissions column already exists, skipping\n");
      } else {
        throw error;
      }
    }

    // Migration 2: Create messages table
    console.log("Migration 2: Creating messages table...");
    try {
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
      console.log("✅ Messages table created successfully\n");
    } catch (error) {
      if (error.message.includes("already exists")) {
        console.log("⚠️  Messages table already exists, skipping\n");
      } else {
        throw error;
      }
    }

    // Migration 3: Add 2FA columns to users table
    console.log("Migration 3: Adding 2FA columns to users table...");
    const addColumnIfMissing = async (sql) => {
      try {
        await sequelize.query(sql);
      } catch (error) {
        if (error.message.includes("Duplicate column name")) {
          // Column already exists
        } else {
          throw error;
        }
      }
    };

    await addColumnIfMissing(`
      ALTER TABLE users
      ADD COLUMN twoFactorEnabled BOOLEAN NOT NULL DEFAULT FALSE
    `);
    await addColumnIfMissing(`
      ALTER TABLE users
      ADD COLUMN twoFactorSecret VARCHAR(255) NULL
    `);
    await addColumnIfMissing(`
      ALTER TABLE users
      ADD COLUMN twoFactorConfirmedAt DATETIME NULL
    `);
    await addColumnIfMissing(`
      ALTER TABLE users
      ADD COLUMN twoFactorFailedAttempts INT NOT NULL DEFAULT 0
    `);
    await addColumnIfMissing(`
      ALTER TABLE users
      ADD COLUMN twoFactorLockUntil DATETIME NULL
    `);

    console.log("✅ 2FA columns ensured successfully\n");

    // Migration 4: Add lastLoginIp column to users table
    console.log("Migration 4: Adding lastLoginIp column to users table...");
    await addColumnIfMissing(`
      ALTER TABLE users
      ADD COLUMN lastLoginIp VARCHAR(45) NULL
    `);
    console.log("✅ lastLoginIp column ensured successfully\n");

    console.log("=== All Migrations Completed Successfully ===");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run migrations
runMigrations()
  .then(() => {
    console.log("\n✅ Migration process finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration process failed:", error);
    process.exit(1);
  });
