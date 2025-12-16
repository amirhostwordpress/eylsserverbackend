// Migration Script: Add Lawyer Specializations Column
// Run this to add the specializations column to the users table

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function runMigration() {
  console.log('🚀 Starting migration: add_lawyer_specializations\n');

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);
    console.log('');

    // Check if column already exists
    console.log('🔍 Checking if specializations column exists...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'specializations'"
    );

    if (columns.length > 0) {
      console.log('⚠️  Column "specializations" already exists!');
      console.log('   No migration needed.');
      return;
    }

    console.log('📝 Column does not exist. Adding now...');
    console.log('');

    // Run the migration
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN specializations JSON DEFAULT NULL 
      COMMENT 'Array of case type IDs for lawyer specializations'
    `);

    console.log('✅ Migration executed successfully!');
    console.log('');

    // Verify the column was added
    console.log('🔍 Verifying column was added...');
    const [rows] = await connection.execute('DESCRIBE users');
    const specializationsColumn = rows.find(row => row.Field === 'specializations');

    if (specializationsColumn) {
      console.log('✅ Column "specializations" verified in users table');
      console.log('');
      console.log('📊 Column Details:');
      console.log('   Field:', specializationsColumn.Field);
      console.log('   Type:', specializationsColumn.Type);
      console.log('   Null:', specializationsColumn.Null);
      console.log('   Default:', specializationsColumn.Default);
      console.log('');
      console.log('🎉 Migration completed successfully!');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('   1. Restart your backend server');
      console.log('   2. Test the lawyer specializations feature');
      console.log('   3. Create a lawyer and assign case types');
    } else {
      console.log('⚠️  Column not found after migration. Please check manually.');
    }

  } catch (error) {
    console.error('❌ Migration failed!');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Tip: Check your database credentials in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Tip: Database does not exist. Check DB_NAME in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Tip: MySQL server is not running or connection refused');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('');
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
