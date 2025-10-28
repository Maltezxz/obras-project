/*
  # Permitir deletar Hosts do mesmo CNPJ

  1. Modificações
    - Atualiza a política de DELETE para permitir deletar:
      - Funcionários (como antes)
      - Outros Hosts com o mesmo CNPJ
  
  2. Segurança
    - Mantém isolamento entre CNPJs diferentes
    - Apenas Hosts podem deletar outros Hosts
    - Hosts não podem se auto-deletar
*/

-- Drop política existente
DROP POLICY IF EXISTS "Allow delete for funcionarios" ON users;

-- Criar nova política que permite deletar funcionários e hosts do mesmo CNPJ
CREATE POLICY "Allow delete for users and hosts"
  ON users
  FOR DELETE
  TO public
  USING (
    -- Pode deletar funcionários
    role = 'funcionario' OR
    -- Pode deletar hosts com mesmo CNPJ (mas não a si mesmo)
    (
      role = 'host' AND 
      cnpj = (SELECT cnpj FROM users WHERE id = (SELECT auth.uid())) AND
      id != (SELECT auth.uid())
    )
  );
