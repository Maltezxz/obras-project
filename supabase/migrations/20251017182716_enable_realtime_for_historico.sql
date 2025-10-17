/*
  # Habilitar Realtime para histórico e outras tabelas
  
  1. Configuração
    - Habilita realtime para tabela historico
    - Habilita realtime para tabela obras
    - Habilita realtime para tabela movimentacoes
  
  2. Objetivo
    - Permitir que o frontend receba atualizações em tempo real
    - Sincronizar automaticamente o histórico quando eventos ocorrem
*/

-- Habilitar Realtime para a tabela historico
ALTER PUBLICATION supabase_realtime ADD TABLE historico;

-- Habilitar Realtime para a tabela obras (se ainda não estiver habilitado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'obras'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE obras;
  END IF;
END $$;

-- Habilitar Realtime para a tabela movimentacoes (se ainda não estiver habilitado)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'movimentacoes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE movimentacoes;
  END IF;
END $$;
