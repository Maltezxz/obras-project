/*
  # Permitir Hosts visualizarem outros Hosts do mesmo CNPJ

  1. Modificações
    - Atualiza a política "Users can view profiles" para permitir que Hosts vejam:
      - Seu próprio perfil
      - Funcionários que criaram (host_id = seu ID)
      - Outros Hosts com o mesmo CNPJ
  
  2. Segurança
    - Mantém isolamento entre CNPJs diferentes
    - Hosts só veem outros Hosts da mesma empresa
    - Funcionários continuam vendo apenas seu próprio perfil
*/

-- Drop política existente
DROP POLICY IF EXISTS "Users can view profiles" ON users;

-- Criar nova política que permite Hosts verem outros Hosts do mesmo CNPJ
CREATE POLICY "Users can view profiles"
  ON users
  FOR SELECT
  TO public
  USING (
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
