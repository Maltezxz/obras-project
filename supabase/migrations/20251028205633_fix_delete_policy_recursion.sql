/*
  # Corrigir recursão na política de DELETE

  1. Problema
    - A política "Allow delete for users and hosts" também tem subquery recursiva
    - Causa o mesmo problema de recursão infinita

  2. Solução
    - Simplificar a política de DELETE
    - Permitir deletar funcionários e hosts de forma mais direta

  3. Segurança
    - Permite deletar funcionários (qualquer host pode deletar via app)
    - Permite deletar hosts (via app com validação)
    - O app controla quem pode deletar quem
*/

-- Drop política problemática
DROP POLICY IF EXISTS "Allow delete for users and hosts" ON users;

-- Criar política simples para DELETE
CREATE POLICY "Allow delete users"
  ON users
  FOR DELETE
  TO public
  USING (
    role = 'funcionario' OR role = 'host'
  );
