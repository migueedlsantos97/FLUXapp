-- Add user_id column to sessions table and password_hash to users table for custom auth
-- Sessions table: add user_id if not exists
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id VARCHAR;

-- Users table: add password_hash column for custom auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR;

-- Clean up old session data that doesn't have user_id
DELETE FROM sessions WHERE user_id IS NULL;
