/*
  # Permitir leitura pública das permissões
  
  Como o sistema usa autenticação customizada (não Supabase Auth),
  auth.uid() retorna NULL, bloqueando o acesso dos usuários funcionários.
  
  Esta migração adiciona uma política que permite leitura pública da tabela
  user_obra_permissions, mantendo as restrições de escrita.
*/

-- Adicionar política de leitura pública
CREATE POLICY "public_read_permissions"
  ON user_obra_permissions FOR SELECT
  TO public
  USING (true);

-- A política authenticated_select_permissions continua existindo
-- mas agora temos também a pública como fallback
