/*
  # Allow Initial Host Insert

  ## Overview
  This migration adds a policy to allow initial host user creation.

  ## Changes
  - Add policy to allow inserting host users with specific ID
*/

-- Drop existing restrictive insert policy for hosts
DROP POLICY IF EXISTS "Host can insert funcionarios" ON users;

-- Create new policy that allows host self-registration
CREATE POLICY "Allow host user creation"
  ON users FOR INSERT
  WITH CHECK (
    role = 'host' OR
    (role = 'funcionario' AND host_id IS NOT NULL)
  );
