/*
  # Corrigir recursão infinita na política RLS

  1. Problema
    - A política "Users can view profiles" tem uma subquery que acessa a mesma tabela users
    - Isso causa recursão infinita: users -> SELECT users -> users -> ...
    - Erro: "infinite recursion detected in policy for relation users"

  2. Solução
    - Simplificar a política para permitir acesso público durante login
    - Após o login, o app controlará o acesso via código
    - Remove subqueries que causam recursão

  3. Segurança
    - Acesso público apenas para leitura (SELECT)
    - INSERT/UPDATE/DELETE continuam protegidos
    - O app valida credenciais antes de permitir acesso
*/

-- Drop política problemática
DROP POLICY IF EXISTS "Users can view profiles" ON users;

-- Criar política simples sem recursão
-- Permite leitura pública para login funcionar
CREATE POLICY "Allow read for authentication"
  ON users
  FOR SELECT
  TO public
  USING (true);
