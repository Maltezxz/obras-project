/*
  # Correção FINAL do RLS para Ferramentas
  
  1. Desabilita completamente o RLS na tabela ferramentas
  2. Remove todas as policies existentes
  3. Permite acesso completo sem autenticação
  
  IMPORTANTE: Esta é uma solução temporária que permite acesso total aos dados.
  O RLS foi desabilitado para garantir que as ferramentas sempre apareçam.
*/

-- Remover TODAS as policies existentes
DROP POLICY IF EXISTS "ferramentas_all_operations" ON ferramentas;
DROP POLICY IF EXISTS "Allow all operations on ferramentas" ON ferramentas;
DROP POLICY IF EXISTS "Allow public read access to ferramentas" ON ferramentas;

-- Desabilitar RLS completamente
ALTER TABLE ferramentas DISABLE ROW LEVEL SECURITY;
