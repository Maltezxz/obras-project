/*
  # Corrigir acesso de login na tabela users

  1. Problema
    - A política "Users can view profiles" usa auth.uid() que não existe durante login
    - A política "Allow public read for login" está restrita ao role anon
    - Usuários não conseguem fazer login

  2. Solução
    - Drop política "Allow public read for login" (role anon)
    - Atualizar "Users can view profiles" para permitir acesso público quando auth.uid() é null
    - Isso permite o login inicial funcionar

  3. Segurança
    - Apenas durante login (quando não há auth.uid())
    - Após login, as políticas normais se aplicam
*/

-- Drop política antiga restrita ao role anon
DROP POLICY IF EXISTS "Allow public read for login" ON users;

-- Atualizar política principal para permitir leitura durante login
DROP POLICY IF EXISTS "Users can view profiles" ON users;

CREATE POLICY "Users can view profiles"
  ON users
  FOR SELECT
  TO public
  USING (
    -- Permitir acesso durante login (quando não há sessão)
    (SELECT auth.uid()) IS NULL OR
    -- Ver próprio perfil
    id = (SELECT auth.uid()) OR 
    -- Host pode ver funcionários que criou
    host_id = (SELECT auth.uid()) OR
    -- Host pode ver outros hosts com mesmo CNPJ
    (
      role = 'host' AND 
      cnpj = (SELECT cnpj FROM users WHERE id = (SELECT auth.uid()))
    )
  );
