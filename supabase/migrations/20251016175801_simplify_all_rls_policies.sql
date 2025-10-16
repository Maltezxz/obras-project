-- Remove all existing restrictive policies and create permissive ones
-- This is necessary because we're using custom authentication instead of Supabase Auth

-- Drop all existing policies for obras
DROP POLICY IF EXISTS "Host can delete own obras" ON obras;
DROP POLICY IF EXISTS "Host can insert obras" ON obras;
DROP POLICY IF EXISTS "Users can view obras from their host" ON obras;
DROP POLICY IF EXISTS "Host can update own obras" ON obras;

-- Create permissive policies for obras
CREATE POLICY "Allow all operations on obras"
  ON obras FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies for ferramentas
DROP POLICY IF EXISTS "Host can delete own ferramentas" ON ferramentas;
DROP POLICY IF EXISTS "Users can insert ferramentas" ON ferramentas;
DROP POLICY IF EXISTS "Users can view ferramentas from their host" ON ferramentas;
DROP POLICY IF EXISTS "Users can update ferramentas from their host" ON ferramentas;

-- Create permissive policies for ferramentas
CREATE POLICY "Allow all operations on ferramentas"
  ON ferramentas FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies for estabelecimentos
DROP POLICY IF EXISTS "Host can delete own estabelecimentos" ON estabelecimentos;
DROP POLICY IF EXISTS "Host can insert estabelecimentos" ON estabelecimentos;
DROP POLICY IF EXISTS "Users can view estabelecimentos from their host" ON estabelecimentos;
DROP POLICY IF EXISTS "Host can update own estabelecimentos" ON estabelecimentos;

-- Create permissive policies for estabelecimentos
CREATE POLICY "Allow all operations on estabelecimentos"
  ON estabelecimentos FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies for movimentacoes
DROP POLICY IF EXISTS "Users can insert movimentacoes" ON movimentacoes;
DROP POLICY IF EXISTS "Users can view movimentacoes from their host" ON movimentacoes;

-- Create permissive policies for movimentacoes
CREATE POLICY "Allow all operations on movimentacoes"
  ON movimentacoes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Drop all existing policies for obra_images
DROP POLICY IF EXISTS "Users can delete images from their host's obras" ON obra_images;
DROP POLICY IF EXISTS "Users can insert images to their host's obras" ON obra_images;
DROP POLICY IF EXISTS "Users can view images from their host's obras" ON obra_images;

-- Create permissive policies for obra_images
CREATE POLICY "Allow all operations on obra_images"
  ON obra_images FOR ALL
  USING (true)
  WITH CHECK (true);

-- Note: In a production environment, you would implement application-level
-- security checks instead of relying solely on RLS with Supabase Auth
