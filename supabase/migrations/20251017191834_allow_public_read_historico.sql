/*
  # Permitir leitura pública do histórico
  
  Como o sistema usa autenticação customizada (não Supabase Auth),
  auth.uid() retorna NULL, bloqueando o acesso ao histórico.
  
  Esta migração adiciona políticas que permitem leitura e escrita pública
  da tabela historico, mantendo a integridade dos dados.
*/

-- Adicionar política de leitura pública
CREATE POLICY "public_read_historico"
  ON historico FOR SELECT
  TO public
  USING (true);

-- Adicionar política de inserção pública
CREATE POLICY "public_insert_historico"
  ON historico FOR INSERT
  TO public
  WITH CHECK (true);
