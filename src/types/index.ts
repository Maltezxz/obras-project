export interface User {
  id: string;
  user_id?: number;
  name: string;
  email: string;
  cnpj?: string;
  role: 'host' | 'funcionario';
  host_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Obra {
  id: string;
  title: string;
  description: string;
  endereco: string;
  status: 'ativa' | 'finalizada';
  owner_id: string;
  start_date: string;
  end_date?: string | null;
  engenheiro?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Estabelecimento {
  id: string;
  name: string;
  endereco: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Ferramenta {
  id: string;
  name: string;
  tipo?: string;
  modelo: string;
  serial: string;
  status: 'disponivel' | 'em_uso' | 'desaparecida';
  current_type?: 'obra' | 'estabelecimento';
  current_id?: string;
  cadastrado_por: string;
  owner_id: string;
  // Novos campos
  descricao?: string;
  nf?: string;
  nf_image_url?: string;
  image_url?: string;
  data?: string;
  valor?: number;
  tempo_garantia_dias?: number;
  garantia?: string;
  marca?: string;
  numero_lacre?: string;
  numero_placa?: string;
  adesivo?: string;
  usuario?: string;
  obra?: string;
  created_at: string;
  updated_at: string;
}

export interface Movimentacao {
  id: string;
  ferramenta_id: string;
  from_type?: string;
  from_id?: string;
  to_type: string;
  to_id: string;
  user_id: string;
  note: string;
  created_at: string;
}

export interface ObraImage {
  id: string;
  obra_id: string;
  image_url: string;
  description: string;
  display_order: number;
  uploaded_by: string;
  created_at: string;
}

export interface AuthContextType {
  user: User | null;
  session: unknown;
  loading: boolean;
  signIn: (cnpj: string, username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncUserIds?: (authUserId: string, tableUserId: string) => Promise<boolean>;
  addEmployee?: (employeeData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'host_id' | 'cnpj'>, password: string) => Promise<User>;
  removeEmployee?: (employeeId: string) => Promise<void>;
  getEmployees?: () => Promise<User[]>;
  getCompanyHostIds?: () => Promise<string[]>;
  isProtectedUser?: (userId: string) => boolean;
}
