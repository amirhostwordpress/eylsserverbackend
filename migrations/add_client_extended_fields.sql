-- Add extended fields for client data import
-- Run this SQL migration to add new columns to Users table

-- Add columns without inline constraints to avoid index limit
ALTER TABLE users ADD COLUMN IF NOT EXISTS clientNumber VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emiratesId VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsappNumber VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS landlineNumber VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS companyName VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS companyAddress TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS companyEmail VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS companyPhone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employerName VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add unique constraint for clientNumber (only if you have index space)
-- If this fails due to too many indexes, skip it - application will handle uniqueness
-- ALTER TABLE users ADD UNIQUE KEY unique_clientNumber (clientNumber);

-- Optional: Add index for clientNumber for faster searches
-- Only run if you have available index slots
-- CREATE INDEX idx_users_clientNumber ON users(clientNumber);
