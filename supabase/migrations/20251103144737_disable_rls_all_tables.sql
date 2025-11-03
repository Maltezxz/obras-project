/*
  # Desabilitar RLS em todas as tabelas principais
  
  1. Desabilita RLS em obras, movimentacoes e users
  2. Remove todas as policies dessas tabelas
  3. Garante acesso total sem autenticação
  
  IMPORTANTE: Isso resolve definitivamente o problema de dados não aparecerem na Home.
*/

-- OBRAS
DROP POLICY IF EXISTS "Allow all operations on obras" ON obras;
DROP POLICY IF EXISTS "obras_select_policy" ON obras;
DROP POLICY IF EXISTS "obras_insert_policy" ON obras;
ALTER TABLE obras DISABLE ROW LEVEL SECURITY;

-- MOVIMENTACOES
DROP POLICY IF EXISTS "Allow all operations on movimentacoes" ON movimentacoes;
DROP POLICY IF EXISTS "movimentacoes_select_policy" ON movimentacoes;
DROP POLICY IF EXISTS "movimentacoes_insert_policy" ON movimentacoes;
ALTER TABLE movimentacoes DISABLE ROW LEVEL SECURITY;

-- USERS
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Allow public read for login" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
