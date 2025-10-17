/*
  # Simplificar políticas de permissões de obras
  
  1. Remove todas as políticas existentes
  2. Cria políticas ultra-simplificadas que funcionam
  
  A política de inserção agora permite que qualquer usuário autenticado
  insira permissões onde ele é o host_id, sem verificações complexas.
*/

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "View own or managed permissions" ON user_obra_permissions;
DROP POLICY IF EXISTS "Hosts create permissions" ON user_obra_permissions;
DROP POLICY IF EXISTS "Hosts delete permissions" ON user_obra_permissions;
DROP POLICY IF EXISTS "Hosts update permissions" ON user_obra_permissions;

-- Política de leitura: usuários autenticados podem ver permissões onde são host ou user
CREATE POLICY "authenticated_select_permissions"
  ON user_obra_permissions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = host_id
  );

-- Política de inserção: usuários autenticados podem inserir onde são o host
CREATE POLICY "authenticated_insert_permissions"
  ON user_obra_permissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Política de exclusão: usuários autenticados podem deletar onde são o host
CREATE POLICY "authenticated_delete_permissions"
  ON user_obra_permissions FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- Política de atualização: usuários autenticados podem atualizar onde são o host
CREATE POLICY "authenticated_update_permissions"
  ON user_obra_permissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);
