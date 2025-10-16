-- Allow public (anonymous) read access to users table for login
-- This is necessary because users need to query the users table before they are authenticated
CREATE POLICY "Allow public read for login"
  ON users FOR SELECT
  TO anon
  USING (true);

-- Note: This allows reading all user data. In production, you may want to restrict this
-- to only return specific columns needed for login (e.g., id, cnpj, name)
