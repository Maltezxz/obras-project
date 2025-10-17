/*
  # Corrigir políticas de permissões de obras
  
  1. Remove políticas antigas
  2. Cria novas políticas simplificadas e funcionais
  
  As novas políticas permitem:
  - Hosts criar permissões para usuários que eles criaram
  - Hosts deletar permissões que eles criaram
  - Usuários visualizar suas próprias permissões
  - Hosts visualizar permissões de seus usuários
*/

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own permissions" ON user_obra_permissions;
DROP POLICY IF EXISTS "Hosts can create permissions for their users" ON user_obra_permissions;
DROP POLICY IF EXISTS "Hosts can delete permissions for their users" ON user_obra_permissions;

-- Política de leitura: usuários podem ver suas próprias permissões, hosts podem ver todas as permissões de seus usuários
CREATE POLICY "View own or managed permissions"
  ON user_obra_permissions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = host_id
  );

-- Política de inserção: hosts podem criar permissões para seus usuários
CREATE POLICY "Hosts create permissions"
  ON user_obra_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = host_id AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = user_obra_permissions.user_id 
      AND users.host_id = auth.uid()
    )
  );

-- Política de exclusão: hosts podem deletar permissões que criaram
CREATE POLICY "Hosts delete permissions"
  ON user_obra_permissions FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Política de atualização: hosts podem atualizar permissões que criaram
CREATE POLICY "Hosts update permissions"
  ON user_obra_permissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);
