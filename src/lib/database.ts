import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cnpj TEXT,
    role TEXT NOT NULL CHECK (role IN ('host', 'funcionario')),
    host_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_credentials (
    user_id TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS obras (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    endereco TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada')),
    owner_id TEXT NOT NULL,
    start_date TEXT DEFAULT (date('now')),
    end_date TEXT,
    engenheiro TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS estabelecimentos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    endereco TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ferramentas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tipo TEXT DEFAULT '',
    modelo TEXT DEFAULT '',
    serial TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'desaparecida')),
    current_type TEXT CHECK (current_type IN ('obra', 'estabelecimento')),
    current_id TEXT,
    cadastrado_por TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    descricao TEXT DEFAULT '',
    nf TEXT DEFAULT '',
    nf_image_url TEXT,
    data TEXT,
    valor REAL,
    tempo_garantia_dias INTEGER,
    garantia TEXT DEFAULT '',
    marca TEXT DEFAULT '',
    numero_lacre TEXT DEFAULT '',
    numero_placa TEXT DEFAULT '',
    adesivo TEXT DEFAULT '',
    usuario TEXT DEFAULT '',
    obra TEXT DEFAULT '',
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (cadastrado_por) REFERENCES users(id),
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS movimentacoes (
    id TEXT PRIMARY KEY,
    ferramenta_id TEXT NOT NULL,
    from_type TEXT,
    from_id TEXT,
    to_type TEXT NOT NULL,
    to_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ferramenta_id) REFERENCES ferramentas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS historico (
    id TEXT PRIMARY KEY,
    ferramenta_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    location_type TEXT,
    location_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (ferramenta_id) REFERENCES ferramentas(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS obra_images (
    id TEXT PRIMARY KEY,
    obra_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    uploaded_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_obra_permissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    obra_id TEXT NOT NULL,
    can_view INTEGER DEFAULT 0,
    can_edit INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (obra_id) REFERENCES obras(id) ON DELETE CASCADE,
    UNIQUE(user_id, obra_id)
  );

  CREATE TABLE IF NOT EXISTS user_ferramenta_permissions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    ferramenta_id TEXT NOT NULL,
    can_view INTEGER DEFAULT 0,
    can_edit INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ferramenta_id) REFERENCES ferramentas(id) ON DELETE CASCADE,
    UNIQUE(user_id, ferramenta_id)
  );

  CREATE INDEX IF NOT EXISTS idx_users_host_id ON users(host_id);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
  CREATE INDEX IF NOT EXISTS idx_obras_owner_id ON obras(owner_id);
  CREATE INDEX IF NOT EXISTS idx_obras_status ON obras(status);
  CREATE INDEX IF NOT EXISTS idx_estabelecimentos_owner_id ON estabelecimentos(owner_id);
  CREATE INDEX IF NOT EXISTS idx_ferramentas_owner_id ON ferramentas(owner_id);
  CREATE INDEX IF NOT EXISTS idx_ferramentas_current ON ferramentas(current_type, current_id);
  CREATE INDEX IF NOT EXISTS idx_ferramentas_status ON ferramentas(status);
  CREATE INDEX IF NOT EXISTS idx_movimentacoes_ferramenta_id ON movimentacoes(ferramenta_id);
  CREATE INDEX IF NOT EXISTS idx_movimentacoes_user_id ON movimentacoes(user_id);
  CREATE INDEX IF NOT EXISTS idx_historico_ferramenta_id ON historico(ferramenta_id);
  CREATE INDEX IF NOT EXISTS idx_historico_user_id ON historico(user_id);
  CREATE INDEX IF NOT EXISTS idx_obra_images_obra_id ON obra_images(obra_id);
`;

const INITIAL_DATA = `
  INSERT OR IGNORE INTO users (id, name, email, cnpj, role, host_id) VALUES
  ('host-fernando', 'Fernando Antunes', 'fernando@pratica.eng.br', '12345678000190', 'host', NULL);

  INSERT OR IGNORE INTO user_credentials (user_id, password_hash) VALUES
  ('host-fernando', '${btoa('senha123')}');
`;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function initDatabase(): Promise<Database> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    const savedDb = localStorage.getItem('obrasflow_database');

    if (savedDb) {
      const uint8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uint8Array);
      console.log('Database loaded from localStorage');
    } else {
      db = new SQL.Database();
      db.run(SCHEMA);
      db.run(INITIAL_DATA);
      saveDatabase();
      console.log('New database created');
    }

    return db;
  })();

  return initPromise;
}

export function saveDatabase(): void {
  if (!db) return;
  const data = db.export();
  const buffer = JSON.stringify(Array.from(data));
  localStorage.setItem('obrasflow_database', buffer);
}

export async function getDatabase(): Promise<Database> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

export function query(sql: string, params: any[] = []): any[] {
  if (!db) throw new Error('Database not initialized');

  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);

    const results: any[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      results.push(row);
    }
    stmt.free();

    return results;
  } catch (error) {
    console.error('Query error:', error, { sql, params });
    throw error;
  }
}

export function execute(sql: string, params: any[] = []): void {
  if (!db) throw new Error('Database not initialized');

  try {
    db.run(sql, params);
    saveDatabase();
  } catch (error) {
    console.error('Execute error:', error, { sql, params });
    throw error;
  }
}

export async function insertOne(table: string, data: Record<string, any>): Promise<string> {
  const id = data.id || generateId();
  const columns = Object.keys(data);
  const values = Object.values(data);

  columns.unshift('id');
  values.unshift(id);

  const placeholders = values.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

  execute(sql, values);
  return id;
}

export async function updateOne(table: string, id: string, data: Record<string, any>): Promise<void> {
  const updates = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];

  const sql = `UPDATE ${table} SET ${updates}, updated_at = datetime('now') WHERE id = ?`;
  execute(sql, values);
}

export async function deleteOne(table: string, id: string): Promise<void> {
  execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
}

export async function selectAll(table: string, where?: string, params: any[] = []): Promise<any[]> {
  const sql = where ? `SELECT * FROM ${table} WHERE ${where}` : `SELECT * FROM ${table}`;
  return query(sql, params);
}

export async function selectOne(table: string, where: string, params: any[] = []): Promise<any | null> {
  const results = await selectAll(table, where, params);
  return results.length > 0 ? results[0] : null;
}

export { generateId };
