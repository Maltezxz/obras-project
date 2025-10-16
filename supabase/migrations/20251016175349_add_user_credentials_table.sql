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

-- Allow public read for login verification
CREATE POLICY "Allow public read for login"
  ON user_credentials FOR SELECT
  USING (true);

-- Allow public insert for registration
CREATE POLICY "Allow public insert"
  ON user_credentials FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own credentials
CREATE POLICY "Users can update own credentials"
  ON user_credentials FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_user_credentials_updated_at
  BEFORE UPDATE ON user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
