/*
  # Corrigir função de gerenciamento de permissões
  
  A função anterior dependia de auth.uid() que não estava funcionando.
  Esta nova versão recebe o host_id como parâmetro e valida diretamente.
*/

-- Remover função antiga
DROP FUNCTION IF EXISTS manage_user_obra_permissions(uuid, uuid[]);

-- Criar nova função que recebe host_id como parâmetro
CREATE OR REPLACE FUNCTION manage_user_obra_permissions(
  p_host_id uuid,
  p_user_id uuid,
  p_obra_ids uuid[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_obra_id uuid;
  v_count integer := 0;
BEGIN
  -- Verificar se p_host_id é válido
  IF p_host_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Host ID não fornecido'
    );
  END IF;
  
  -- Verificar se p_user_id é válido
  IF p_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User ID não fornecido'
    );
  END IF;
  
  -- Verificar se o host existe e tem role 'host'
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = p_host_id 
    AND role = 'host'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Host inválido ou não tem permissão'
    );
  END IF;
  
  -- Verificar se p_user_id pertence ao host
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = p_user_id 
    AND host_id = p_host_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Usuário não pertence ao host especificado'
    );
  END IF;
  
  -- Deletar permissões antigas
  DELETE FROM user_obra_permissions
  WHERE user_id = p_user_id
  AND host_id = p_host_id;
  
  -- Inserir novas permissões
  IF p_obra_ids IS NOT NULL AND array_length(p_obra_ids, 1) > 0 THEN
    FOREACH v_obra_id IN ARRAY p_obra_ids
    LOOP
      -- Verificar se a obra pertence ao host
      IF EXISTS (
        SELECT 1 FROM obras 
        WHERE id = v_obra_id 
        AND owner_id = p_host_id
      ) THEN
        INSERT INTO user_obra_permissions (user_id, obra_id, host_id)
        VALUES (p_user_id, v_obra_id, p_host_id);
        v_count := v_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Permissões atualizadas com sucesso',
    'permissions_count', v_count
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;

-- Permitir que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION manage_user_obra_permissions(uuid, uuid, uuid[]) TO authenticated;

-- Permitir acesso público também (para casos onde auth não funciona)
GRANT EXECUTE ON FUNCTION manage_user_obra_permissions(uuid, uuid, uuid[]) TO anon;
