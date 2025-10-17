/*
  # Criar tabela de permissões de acesso às obras
  
  1. Nova Tabela
    - `user_obra_permissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, referência para users) - usuário que recebe a permissão
      - `obra_id` (uuid, referência para obras) - obra que o usuário pode acessar
      - `host_id` (uuid, referência para users) - host que concedeu a permissão
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Segurança
    - Habilitar RLS
    - Políticas para hosts gerenciarem permissões de seus usuários
    - Políticas para usuários visualizarem suas próprias permissões
  
  3. Índices
    - Índices para otimizar consultas de permissões
*/

-- Criar tabela de permissões de acesso às obras
CREATE TABLE IF NOT EXISTS user_obra_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  obra_id uuid NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, obra_id)
);

-- Habilitar RLS
ALTER TABLE user_obra_permissions ENABLE ROW LEVEL SECURITY;

-- Política de leitura: usuários podem ver suas próprias permissões e hosts podem ver permissões de seus usuários
CREATE POLICY "Users can view own permissions"
  ON user_obra_permissions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    host_id = auth.uid()
  );

-- Política de inserção: hosts podem criar permissões para seus usuários
CREATE POLICY "Hosts can create permissions for their users"
  ON user_obra_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    host_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = user_obra_permissions.user_id
      AND host_id = auth.uid()
    )
  );

-- Política de exclusão: hosts podem remover permissões de seus usuários
CREATE POLICY "Hosts can delete permissions for their users"
  ON user_obra_permissions FOR DELETE
  TO authenticated
  USING (
    host_id = auth.uid()
  );

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_obra_permissions_user_id ON user_obra_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_obra_permissions_obra_id ON user_obra_permissions(obra_id);
CREATE INDEX IF NOT EXISTS idx_user_obra_permissions_host_id ON user_obra_permissions(host_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_obra_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_user_obra_permissions_updated_at_trigger ON user_obra_permissions;
CREATE TRIGGER update_user_obra_permissions_updated_at_trigger
  BEFORE UPDATE ON user_obra_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_obra_permissions_updated_at();
