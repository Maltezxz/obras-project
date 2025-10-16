/*
  # Add User Credentials Table

  ## Overview
  This migration creates a separate table to store user credentials securely,
  allowing us to authenticate users without relying on Supabase Auth for all users.

  ## New Tables

  ### 1. `user_credentials`
  Stores user credentials for custom authentication
  - `id` (uuid, primary key) - Unique credential identifier
  - `user_id` (uuid, unique) - Reference to user
  - `password_hash` (text) - Hashed password (using bcrypt or similar)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on the table
  - Only authenticated users can read their own credentials
  - Password changes are tracked via updated_at

  ## Important Notes
  1. Passwords should be hashed before storage
  2. This table is separate from Supabase Auth
  3. Used for Host and Funcionario authentication
*/

-- Create user_credentials table
CREATE TABLE IF NOT EXISTS user_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own credentials"
  ON user_credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON user_credentials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Host can view funcionarios credentials"
  ON user_credentials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_id AND users.host_id = auth.uid()
    )
  );

CREATE POLICY "Allow insert for new users"
  ON user_credentials FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
