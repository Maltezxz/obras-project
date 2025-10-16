/*
  # Fix Security and Performance Issues

  1. Add Missing Indexes
    - Add index on ferramentas.cadastrado_por (foreign key)
    - Add index on obra_images.uploaded_by (foreign key)

  2. Optimize RLS Policies
    - Fix auth function calls to use (select auth.uid()) pattern
    - This prevents re-evaluation for each row

  3. Remove Unused Indexes
    - Drop indexes that are not being used

  4. Fix Function Search Paths
    - Add security definer and search_path to functions

  5. Consolidate Multiple Permissive Policies
    - Merge multiple SELECT policies into single policy
*/

-- 1. Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_ferramentas_cadastrado_por ON ferramentas(cadastrado_por);
CREATE INDEX IF NOT EXISTS idx_obra_images_uploaded_by ON obra_images(uploaded_by);

-- 2. Drop unused indexes
DROP INDEX IF EXISTS idx_ferramentas_current;
DROP INDEX IF EXISTS idx_ferramentas_marca;
DROP INDEX IF EXISTS idx_ferramentas_numero_lacre;
DROP INDEX IF EXISTS idx_ferramentas_numero_placa;
DROP INDEX IF EXISTS idx_obra_images_obra_id;

-- 3. Drop existing users policies to recreate them optimized
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Host can view their funcionarios" ON users;
DROP POLICY IF EXISTS "Host can update their funcionarios" ON users;

-- 4. Create consolidated and optimized RLS policies for users
CREATE POLICY "Users can view profiles"
  ON users
  FOR SELECT
  TO public
  USING (
    id = (SELECT auth.uid()) OR 
    host_id = (SELECT auth.uid())
  );

CREATE POLICY "Host can update funcionarios"
  ON users
  FOR UPDATE
  TO public
  USING (
    role = 'funcionario' AND 
    host_id = (SELECT auth.uid())
  );

-- 5. Fix function search paths for security
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS INTEGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
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

CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := generate_user_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
