/*
  # Add numeric user ID field

  1. Changes
    - Add user_id field (numeric 7-digit identifier) to users table
    - Add unique constraint to user_id
    - Create function to generate random 7-digit user_id
    - Create trigger to auto-generate user_id on insert
  
  2. Security
    - Maintains existing RLS policies
    - user_id is auto-generated and unique
*/

-- Add user_id column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN user_id INTEGER UNIQUE;
  END IF;
END $$;

-- Create function to generate random 7-digit user_id
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS INTEGER AS $$
DECLARE
  new_id INTEGER;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  LOOP
    -- Generate random 7-digit number (1000000 to 9999999)
    new_id := floor(random() * 9000000 + 1000000)::INTEGER;
    
    -- Check if it already exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = new_id) THEN
      RETURN new_id;
    END IF;
    
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique user_id after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := generate_user_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_user_id_trigger ON users;

CREATE TRIGGER set_user_id_trigger
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- Backfill existing users with user_id
UPDATE users 
SET user_id = generate_user_id()
WHERE user_id IS NULL;
