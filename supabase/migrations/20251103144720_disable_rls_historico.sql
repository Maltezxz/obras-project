/*
  # Desabilitar RLS na tabela historico
  
  1. Remove todas as policies existentes
  2. Desabilita completamente o RLS
  3. Permite acesso total sem autenticação
  
  IMPORTANTE: Isso garante que as atividades recentes sempre apareçam na Home.
*/

-- Remover TODAS as policies existentes
DROP POLICY IF EXISTS "Allow public read access to historico" ON historico;
DROP POLICY IF EXISTS "historico_select_policy" ON historico;
DROP POLICY IF EXISTS "historico_insert_policy" ON historico;

-- Desabilitar RLS completamente
ALTER TABLE historico DISABLE ROW LEVEL SECURITY;
