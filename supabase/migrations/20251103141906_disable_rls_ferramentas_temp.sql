
/*
  # Desabilitar RLS temporariamente em ferramentas para debug
  
  1. Desabilita RLS em ferramentas
  2. Remove a policy antiga
*/

-- Desabilitar RLS
ALTER TABLE ferramentas DISABLE ROW LEVEL SECURITY;

-- Remover a policy antiga
DROP POLICY IF EXISTS "Allow all operations on ferramentas" ON ferramentas;
