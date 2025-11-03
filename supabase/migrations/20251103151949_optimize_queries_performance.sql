/*
  # Otimização de Performance - Resolver Timeouts

  ## Problema Identificado
  - Queries estavam dando timeout devido a imagens grandes (6MB+) em base64
  - Tabela ferramentas com 42MB de índices vs 8KB de dados
  - Statement timeout cancelando todas as queries

  ## Solução
  1. Criar índices compostos otimizados para queries comuns
  2. Remover índices desnecessários
  3. Adicionar índice para consultas com owner_id + status

  ## Índices Criados
  - `idx_ferramentas_owner_status` - Para queries que filtram por owner_id e status
  - `idx_obras_owner_status` - Para queries que filtram por owner_id e status
*/

-- Remover índices redundantes que já estão cobertos por índices compostos
DROP INDEX IF EXISTS idx_ferramentas_status;
DROP INDEX IF EXISTS idx_obras_status;

-- Criar índices compostos otimizados
CREATE INDEX IF NOT EXISTS idx_ferramentas_owner_status 
  ON ferramentas(owner_id, status) 
  WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_obras_owner_status 
  ON obras(owner_id, status) 
  WHERE status IS NOT NULL;

-- Criar índice para consultas de historico recente
CREATE INDEX IF NOT EXISTS idx_historico_owner_created 
  ON historico(owner_id, created_at DESC);
