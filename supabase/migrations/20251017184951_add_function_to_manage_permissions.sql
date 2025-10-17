/*
  # Criar função para gerenciar permissões de obras
  
  Esta função permite que hosts gerenciem permissões de forma programática,
  contornando possíveis problemas com RLS.
  
  A função:
  1. Verifica se o usuário logado é o host dos usuários
  2. Deleta permissões antigas
  3. Insere novas permissões
*/

CREATE OR REPLACE FUNCTION manage_user_obra_permissions(
  p_user_id uuid,
  p_obra_ids uuid[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_host_id uuid;
  v_result json;
  v_obra_id uuid;
BEGIN
  -- Pegar o ID do usuário autenticado
  v_host_id := auth.uid();
  
  -- Verificar se o host_id é válido
  IF v_host_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não autenticado'
    );
  END IF;
  
  -- Verificar se p_user_id pertence ao host
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = p_user_id 
    AND host_id = v_host_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não pertence ao host autenticado'
    );
  END IF;
  
  -- Deletar permissões antigas
  DELETE FROM user_obra_permissions
  WHERE user_id = p_user_id
  AND host_id = v_host_id;
  
  -- Inserir novas permissões
  IF array_length(p_obra_ids, 1) > 0 THEN
    FOREACH v_obra_id IN ARRAY p_obra_ids
    LOOP
      INSERT INTO user_obra_permissions (user_id, obra_id, host_id)
      VALUES (p_user_id, v_obra_id, v_host_id);
    END LOOP;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Permissões atualizadas com sucesso',
    'permissions_count', array_length(p_obra_ids, 1)
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION manage_user_obra_permissions(uuid, uuid[]) TO authenticated;
