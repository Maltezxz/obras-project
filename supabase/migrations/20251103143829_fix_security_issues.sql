
/*
  # Corrigir Problemas de Segurança e Performance

  1. Índices de Foreign Keys
    - Adicionar índice para historico.movimentacao_id
    - Adicionar índice para historico.user_id

  2. Otimizar RLS Policies
    - Atualizar policies para usar (select auth.uid())
    - Remover policies duplicadas

  3. Corrigir Search Path de Funções
    - Adicionar search_path estável

  4. Re-habilitar RLS em ferramentas
*/

-- =====================================================
-- 1. ADICIONAR ÍNDICES DE FOREIGN KEYS FALTANTES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_historico_movimentacao_id ON historico(movimentacao_id);
CREATE INDEX IF NOT EXISTS idx_historico_user_id ON historico(user_id);

-- =====================================================
-- 2. REMOVER POLICIES DUPLICADAS E OTIMIZAR RLS
-- =====================================================

-- HISTORICO: Remover policies duplicadas
DROP POLICY IF EXISTS "public_read_historico" ON historico;
DROP POLICY IF EXISTS "public_insert_historico" ON historico;
DROP POLICY IF EXISTS "Users can view own history" ON historico;
DROP POLICY IF EXISTS "Users can create history entries" ON historico;

-- HISTORICO: Criar policies otimizadas
CREATE POLICY "historico_select_policy"
  ON historico FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "historico_insert_policy"
  ON historico FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- USER_OBRA_PERMISSIONS: Remover policies duplicadas
DROP POLICY IF EXISTS "public_read_permissions" ON user_obra_permissions;
DROP POLICY IF EXISTS "authenticated_select_permissions" ON user_obra_permissions;
DROP POLICY IF EXISTS "authenticated_insert_permissions" ON user_obra_permissions;
DROP POLICY IF EXISTS "authenticated_update_permissions" ON user_obra_permissions;
DROP POLICY IF EXISTS "authenticated_delete_permissions" ON user_obra_permissions;

-- USER_OBRA_PERMISSIONS: Criar policies otimizadas únicas
CREATE POLICY "permissions_select"
  ON user_obra_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "permissions_insert"
  ON user_obra_permissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "permissions_update"
  ON user_obra_permissions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "permissions_delete"
  ON user_obra_permissions FOR DELETE
  TO authenticated
  USING (true);

-- =====================================================
-- 3. CORRIGIR SEARCH_PATH DE FUNÇÕES
-- =====================================================

-- Recriar função update_user_obra_permissions_updated_at com search_path
CREATE OR REPLACE FUNCTION public.update_user_obra_permissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar função manage_user_ferramenta_permissions com search_path
CREATE OR REPLACE FUNCTION public.manage_user_ferramenta_permissions(
  p_user_id uuid,
  p_ferramenta_id uuid,
  p_can_transfer boolean,
  p_can_mark_desaparecida boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO user_ferramenta_permissions (user_id, ferramenta_id, can_transfer, can_mark_desaparecida)
  VALUES (p_user_id, p_ferramenta_id, p_can_transfer, p_can_mark_desaparecida)
  ON CONFLICT (user_id, ferramenta_id)
  DO UPDATE SET
    can_transfer = EXCLUDED.can_transfer,
    can_mark_desaparecida = EXCLUDED.can_mark_desaparecida,
    updated_at = now();
END;
$$;

-- =====================================================
-- 4. RE-HABILITAR RLS EM FERRAMENTAS
-- =====================================================

-- Habilitar RLS
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;

-- Criar policy simples e otimizada para ferramentas
CREATE POLICY "ferramentas_all_operations"
  ON ferramentas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
