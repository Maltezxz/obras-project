/*
  # Remover todas as policies órfãs e configurar corretamente
  
  ## Problema
  - Existem policies antigas nas tabelas mas o RLS está desabilitado
  - Isso causa erros de validação no Supabase Dashboard
  
  ## Solução
  - Remover TODAS as policies antigas
  - Manter RLS desabilitado (já que o app não usa Supabase Auth)
  - Limpar warnings do banco
*/

-- =====================================================
-- USERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Allow delete users" ON users;
DROP POLICY IF EXISTS "Allow insert for funcionarios" ON users;
DROP POLICY IF EXISTS "Allow read for authentication" ON users;
DROP POLICY IF EXISTS "Host can update funcionarios" ON users;
DROP POLICY IF EXISTS "users_public_read" ON users;
DROP POLICY IF EXISTS "users_host_insert" ON users;
DROP POLICY IF EXISTS "users_host_update" ON users;
DROP POLICY IF EXISTS "users_host_delete" ON users;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- FERRAMENTAS TABLE
-- =====================================================
DROP POLICY IF EXISTS "ferramentas_all_operations" ON ferramentas;
DROP POLICY IF EXISTS "ferramentas_host_full_access" ON ferramentas;
DROP POLICY IF EXISTS "ferramentas_funcionario_read" ON ferramentas;
DROP POLICY IF EXISTS "Allow all operations on ferramentas" ON ferramentas;

ALTER TABLE ferramentas DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OBRAS TABLE
-- =====================================================
DROP POLICY IF EXISTS "obras_host_full_access" ON obras;
DROP POLICY IF EXISTS "obras_funcionario_read" ON obras;
DROP POLICY IF EXISTS "Allow all operations on obras" ON obras;
DROP POLICY IF EXISTS "obras_select_policy" ON obras;
DROP POLICY IF EXISTS "obras_insert_policy" ON obras;

ALTER TABLE obras DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- HISTORICO TABLE
-- =====================================================
DROP POLICY IF EXISTS "historico_host_access" ON historico;
DROP POLICY IF EXISTS "historico_funcionario_read" ON historico;
DROP POLICY IF EXISTS "historico_select_policy" ON historico;
DROP POLICY IF EXISTS "historico_insert_policy" ON historico;
DROP POLICY IF EXISTS "Allow public read access to historico" ON historico;

ALTER TABLE historico DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- MOVIMENTACOES TABLE
-- =====================================================
DROP POLICY IF EXISTS "movimentacoes_host_access" ON movimentacoes;
DROP POLICY IF EXISTS "movimentacoes_funcionario_read" ON movimentacoes;
DROP POLICY IF EXISTS "Allow all operations on movimentacoes" ON movimentacoes;
DROP POLICY IF EXISTS "movimentacoes_select_policy" ON movimentacoes;
DROP POLICY IF EXISTS "movimentacoes_insert_policy" ON movimentacoes;

ALTER TABLE movimentacoes DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- TABELAS DE PERMISSÕES - Manter RLS habilitado
-- =====================================================
-- Estas tabelas devem ter RLS porque controlam acesso
ALTER TABLE user_obra_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ferramenta_permissions ENABLE ROW LEVEL SECURITY;
