-- Add specializations field for lawyer case type specializations
-- Run this SQL migration to add specializations column to Users table

-- Add specializations column to store case type IDs as JSON array
ALTER TABLE users ADD COLUMN IF NOT EXISTS specializations JSON DEFAULT NULL COMMENT 'Array of case type IDs for lawyer specializations';

-- This column will store data like: ["case-type-id-1", "case-type-id-2", "case-type-id-3"]
-- Example: ["uuid-criminal", "uuid-family", "uuid-commercial"]
