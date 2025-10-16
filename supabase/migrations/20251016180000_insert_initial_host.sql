/*
  # Insert Initial Host User

  ## Overview
  This migration inserts the initial host user with credentials.

  ## Changes
  - Insert host user Fernando Antunes
  - Insert credentials for the host user
*/

-- Temporarily disable RLS for insert
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials DISABLE ROW LEVEL SECURITY;

-- Insert host user (with specific ID for consistency)
INSERT INTO users (id, name, email, cnpj, role, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Fernando Antunes',
  'fernando.antunes@obrasflow.com',
  '04.205.151/0001-37',
  'host',
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  cnpj = EXCLUDED.cnpj,
  role = EXCLUDED.role,
  updated_at = now();

-- Insert credentials for host (password: 123456 in base64)
INSERT INTO user_credentials (user_id, password_hash, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'MTIzNDU2',
  now(),
  now()
)
ON CONFLICT (user_id) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
