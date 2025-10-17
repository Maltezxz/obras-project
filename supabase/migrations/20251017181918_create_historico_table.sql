/*
  # Criar tabela de histórico de eventos
  
  1. Nova Tabela
    - `historico`
      - `id` (uuid, primary key)
      - `tipo_evento` (text) - 'obra_criada', 'obra_finalizada', 'movimentacao'
      - `descricao` (text) - descrição do evento
      - `obra_id` (uuid, referência opcional para obras)
      - `movimentacao_id` (uuid, referência opcional para movimentações)
      - `user_id` (uuid, referência para usuário que realizou ação)
      - `owner_id` (uuid, referência para dono dos dados)
      - `metadata` (jsonb) - dados adicionais do evento
      - `created_at` (timestamptz)
  
  2. Segurança
    - Habilitar RLS
    - Políticas para usuários autenticados visualizarem seu próprio histórico
*/

-- Criar tabela de histórico
CREATE TABLE IF NOT EXISTS historico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_evento text NOT NULL CHECK (tipo_evento IN ('obra_criada', 'obra_finalizada', 'movimentacao')),
  descricao text NOT NULL,
  obra_id uuid REFERENCES obras(id) ON DELETE CASCADE,
  movimentacao_id uuid REFERENCES movimentacoes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;

-- Política de leitura: usuários podem ver histórico de seus dados
CREATE POLICY "Users can view own history"
  ON historico FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    owner_id IN (SELECT host_id FROM users WHERE id = auth.uid())
  );

-- Política de inserção: usuários podem criar entradas de histórico
CREATE POLICY "Users can create history entries"
  ON historico FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() OR
    owner_id IN (SELECT host_id FROM users WHERE id = auth.uid()) OR
    owner_id IN (SELECT id FROM users WHERE id = auth.uid() AND role = 'host')
  );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_owner_id ON historico(owner_id);
CREATE INDEX IF NOT EXISTS idx_historico_tipo_evento ON historico(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_historico_created_at ON historico(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historico_obra_id ON historico(obra_id) WHERE obra_id IS NOT NULL;
