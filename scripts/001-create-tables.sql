-- Create sessions table for session storage
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions (expire);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create financial_profiles table
CREATE TABLE IF NOT EXISTS financial_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  base_income DOUBLE PRECISION NOT NULL,
  pre_deducted DOUBLE PRECISION NOT NULL DEFAULT 0,
  fixed_costs JSONB NOT NULL DEFAULT '[]',
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL DEFAULT NOW()
);
