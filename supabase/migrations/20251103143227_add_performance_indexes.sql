
/*
  # Adicionar índices para melhorar performance

  1. Índices
    - owner_id em ferramentas (query mais rápida por dono)
    - owner_id em obras (query mais rápida por dono)
    - cnpj em users (query mais rápida por empresa)
    - status em ferramentas (filtros mais rápidos)
    - current_id em ferramentas (busca de localização)
*/

-- Índices para ferramentas
CREATE INDEX IF NOT EXISTS idx_ferramentas_owner_id ON ferramentas(owner_id);
CREATE INDEX IF NOT EXISTS idx_ferramentas_status ON ferramentas(status);
CREATE INDEX IF NOT EXISTS idx_ferramentas_current_id ON ferramentas(current_id);
CREATE INDEX IF NOT EXISTS idx_ferramentas_created_at ON ferramentas(created_at DESC);

-- Índices para obras
CREATE INDEX IF NOT EXISTS idx_obras_owner_id ON obras(owner_id);
CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(status);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_cnpj ON users(cnpj);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
