/*
  # Criar tabela de permissões de ferramentas para usuários

  ## Objetivo
  Permitir que o host controle quais ferramentas cada usuário pode acessar

  ## 1. Nova Tabela
    - `user_ferramenta_permissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key para users)
      - `ferramenta_id` (uuid, foreign key para ferramentas)
      - `host_id` (uuid, foreign key para users - identifica o host que gerencia)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  ## 2. Segurança
    - Habilita RLS na tabela
    - Políticas permitem leitura pública (necessário para funcionamento do app)
    - Apenas hosts podem inserir/atualizar/deletar

  ## 3. Índices
    - Índice único em (user_id, ferramenta_id) para evitar duplicatas
    - Índice em host_id para consultas rápidas por host
*/

-- Criar tabela de permissões de ferramentas
CREATE TABLE IF NOT EXISTS user_ferramenta_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ferramenta_id uuid NOT NULL REFERENCES ferramentas(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ferramenta_id)
);

-- Habilitar RLS
ALTER TABLE user_ferramenta_permissions ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (necessário para app funcionar)
CREATE POLICY "Permitir leitura pública de permissões de ferramentas"
  ON user_ferramenta_permissions
  FOR SELECT
  USING (true);

-- Política de inserção apenas para hosts
CREATE POLICY "Apenas hosts podem inserir permissões de ferramentas"
  ON user_ferramenta_permissions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = host_id
      AND users.role = 'host'
    )
  );

-- Política de atualização apenas para hosts
CREATE POLICY "Apenas hosts podem atualizar permissões de ferramentas"
  ON user_ferramenta_permissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = host_id
      AND users.role = 'host'
    )
  );

-- Política de exclusão apenas para hosts
CREATE POLICY "Apenas hosts podem deletar permissões de ferramentas"
  ON user_ferramenta_permissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = host_id
      AND users.role = 'host'
    )
  );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_ferramenta_permissions_user_id 
  ON user_ferramenta_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ferramenta_permissions_ferramenta_id 
  ON user_ferramenta_permissions(ferramenta_id);
CREATE INDEX IF NOT EXISTS idx_user_ferramenta_permissions_host_id 
  ON user_ferramenta_permissions(host_id);
