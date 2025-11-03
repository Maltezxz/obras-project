
/*
  # Corrigir search_path das funções duplicadas

  1. Recriar a função manage_user_ferramenta_permissions com 3 parâmetros
     - Adicionar search_path = public, pg_temp
     - Manter funcionalidade original
*/

-- Recriar a função com search_path correto
CREATE OR REPLACE FUNCTION public.manage_user_ferramenta_permissions(
  p_host_id uuid,
  p_user_id uuid,
  p_ferramenta_ids uuid[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_host_role text;
  v_permissions_count integer;
BEGIN
  -- Verificar se o host é realmente um host
  SELECT role INTO v_host_role
  FROM users
  WHERE id = p_host_id;

  IF v_host_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Host não encontrado'
    );
  END IF;

  IF v_host_role != 'host' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Apenas hosts podem gerenciar permissões'
    );
  END IF;

  -- Remover permissões existentes do usuário (gerenciadas por este host)
  DELETE FROM user_ferramenta_permissions
  WHERE user_id = p_user_id
  AND host_id = p_host_id;

  -- Inserir novas permissões
  IF array_length(p_ferramenta_ids, 1) > 0 THEN
    INSERT INTO user_ferramenta_permissions (user_id, ferramenta_id, host_id)
    SELECT p_user_id, unnest(p_ferramenta_ids), p_host_id;

    GET DIAGNOSTICS v_permissions_count = ROW_COUNT;
  ELSE
    v_permissions_count := 0;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'permissions_count', v_permissions_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
