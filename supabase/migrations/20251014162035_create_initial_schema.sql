/*
  # Initial Schema for Construction Management System

  ## Overview
  This migration creates the complete database structure for a construction management system
  with two user roles: Host (engineer) and Funcionario (employee).

  ## New Tables

  ### 1. `users`
  Stores user information and roles
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text) - User's full name
  - `email` (text, unique) - User's email address
  - `cnpj` (text) - Company CNPJ (for Host users)
  - `role` (text) - User role: 'host' or 'funcionario'
  - `host_id` (uuid) - Reference to the Host user (for funcionarios)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `obras`
  Stores construction projects
  - `id` (uuid, primary key) - Unique project identifier
  - `title` (text) - Project title
  - `description` (text) - Project description
  - `endereco` (text) - Project address
  - `status` (text) - Status: 'ativa' or 'finalizada'
  - `owner_id` (uuid) - Reference to Host user
  - `start_date` (date) - Project start date
  - `end_date` (date) - Project end date (nullable)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `estabelecimentos`
  Stores permanent storage locations
  - `id` (uuid, primary key) - Unique location identifier
  - `name` (text) - Location name
  - `endereco` (text) - Location address
  - `owner_id` (uuid) - Reference to Host user
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `ferramentas`
  Stores tools and equipment
  - `id` (uuid, primary key) - Unique tool identifier
  - `name` (text) - Tool name
  - `modelo` (text) - Tool model
  - `serial` (text) - Serial number
  - `status` (text) - Status: 'disponivel', 'em_uso', 'desaparecida'
  - `current_type` (text) - Current location type: 'obra' or 'estabelecimento'
  - `current_id` (uuid) - Reference to current location
  - `cadastrado_por` (uuid) - Reference to user who registered the tool
  - `owner_id` (uuid) - Reference to Host user
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. `movimentacoes`
  Stores tool movement history
  - `id` (uuid, primary key) - Unique movement identifier
  - `ferramenta_id` (uuid) - Reference to tool
  - `from_type` (text) - Origin location type
  - `from_id` (uuid) - Origin location ID
  - `to_type` (text) - Destination location type
  - `to_id` (uuid) - Destination location ID
  - `user_id` (uuid) - Reference to user who performed the movement
  - `note` (text) - Optional note
  - `created_at` (timestamptz) - Movement timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users based on roles
  - Host users can access all their data and their funcionarios' data
  - Funcionarios can only access data from their Host

  ## Important Notes
  1. All tables use UUID for primary keys
  2. Timestamps are automatically managed
  3. Foreign key constraints ensure data integrity
  4. RLS policies enforce role-based access control
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  cnpj text,
  role text NOT NULL CHECK (role IN ('host', 'funcionario')),
  host_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create obras table
CREATE TABLE IF NOT EXISTS obras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  endereco text NOT NULL,
  status text NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada')),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create estabelecimentos table
CREATE TABLE IF NOT EXISTS estabelecimentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  endereco text NOT NULL,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ferramentas table
CREATE TABLE IF NOT EXISTS ferramentas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  modelo text DEFAULT '',
  serial text DEFAULT '',
  status text NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'desaparecida')),
  current_type text CHECK (current_type IN ('obra', 'estabelecimento')),
  current_id uuid,
  cadastrado_por uuid NOT NULL REFERENCES users(id),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create movimentacoes table
CREATE TABLE IF NOT EXISTS movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ferramenta_id uuid NOT NULL REFERENCES ferramentas(id) ON DELETE CASCADE,
  from_type text,
  from_id uuid,
  to_type text NOT NULL,
  to_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id),
  note text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE estabelecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ferramentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Host can view their funcionarios"
  ON users FOR SELECT
  TO authenticated
  USING (
    host_id = auth.uid() OR auth.uid() = id
  );

CREATE POLICY "Host can insert funcionarios"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    (role = 'funcionario' AND host_id = auth.uid()) OR
    (role = 'host' AND id = auth.uid())
  );

CREATE POLICY "Host can update their funcionarios"
  ON users FOR UPDATE
  TO authenticated
  USING (host_id = auth.uid() OR auth.uid() = id)
  WITH CHECK (host_id = auth.uid() OR auth.uid() = id);

-- Obras policies
CREATE POLICY "Users can view obras from their host"
  ON obras FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    owner_id IN (SELECT host_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Host can insert obras"
  ON obras FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  );

CREATE POLICY "Host can update own obras"
  ON obras FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  )
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  );

CREATE POLICY "Host can delete own obras"
  ON obras FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  );

-- Estabelecimentos policies
CREATE POLICY "Users can view estabelecimentos from their host"
  ON estabelecimentos FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    owner_id IN (SELECT host_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Host can insert estabelecimentos"
  ON estabelecimentos FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  );

CREATE POLICY "Host can update own estabelecimentos"
  ON estabelecimentos FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  )
  WITH CHECK (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  );

CREATE POLICY "Host can delete own estabelecimentos"
  ON estabelecimentos FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  );

-- Ferramentas policies
CREATE POLICY "Users can view ferramentas from their host"
  ON ferramentas FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    owner_id IN (SELECT host_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert ferramentas"
  ON ferramentas FOR INSERT
  TO authenticated
  WITH CHECK (
    cadastrado_por = auth.uid() AND
    (owner_id = auth.uid() OR owner_id IN (SELECT host_id FROM users WHERE id = auth.uid()))
  );

CREATE POLICY "Users can update ferramentas from their host"
  ON ferramentas FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    owner_id IN (SELECT host_id FROM users WHERE id = auth.uid())
  )
  WITH CHECK (
    owner_id = auth.uid() OR
    owner_id IN (SELECT host_id FROM users WHERE id = auth.uid())
  );

CREATE POLICY "Host can delete own ferramentas"
  ON ferramentas FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'host')
  );

-- Movimentacoes policies
CREATE POLICY "Users can view movimentacoes from their host"
  ON movimentacoes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM ferramentas f
      WHERE f.id = ferramenta_id AND
      (f.owner_id = auth.uid() OR f.owner_id IN (SELECT host_id FROM users WHERE id = auth.uid()))
    )
  );

CREATE POLICY "Users can insert movimentacoes"
  ON movimentacoes FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM ferramentas f
      WHERE f.id = ferramenta_id AND
      (f.owner_id = auth.uid() OR f.owner_id IN (SELECT host_id FROM users WHERE id = auth.uid()))
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_host_id ON users(host_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_obras_owner_id ON obras(owner_id);
CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(status);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_owner_id ON estabelecimentos(owner_id);
CREATE INDEX IF NOT EXISTS idx_ferramentas_owner_id ON ferramentas(owner_id);
CREATE INDEX IF NOT EXISTS idx_ferramentas_current ON ferramentas(current_type, current_id);
CREATE INDEX IF NOT EXISTS idx_ferramentas_status ON ferramentas(status);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_ferramenta_id ON movimentacoes(ferramenta_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_id ON movimentacoes(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obras_updated_at
  BEFORE UPDATE ON obras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estabelecimentos_updated_at
  BEFORE UPDATE ON estabelecimentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ferramentas_updated_at
  BEFORE UPDATE ON ferramentas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();