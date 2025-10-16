// Utilitário para gerenciar ferramentas locais quando Supabase não estiver disponível

export interface LocalFerramenta {
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

const STORAGE_KEY = 'obrasflow_ferramentas';

export const localFerramentasStorage = {
  // Salvar ferramentas no localStorage
  saveFerramentas: (ferramentas: LocalFerramenta[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ferramentas));
    } catch (error) {
      console.error('Erro ao salvar ferramentas no localStorage:', error);
    }
  },

  // Carregar ferramentas do localStorage
  loadFerramentas: (): LocalFerramenta[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar ferramentas do localStorage:', error);
      return [];
    }
  },

  // Adicionar nova ferramenta
  addFerramenta: (ferramenta: Omit<LocalFerramenta, 'id' | 'created_at' | 'updated_at'>): LocalFerramenta => {
    const ferramentas = localFerramentasStorage.loadFerramentas();
    const newFerramenta: LocalFerramenta = {
      ...ferramenta,
      id: `local-ferramenta-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    ferramentas.push(newFerramenta);
    localFerramentasStorage.saveFerramentas(ferramentas);
    return newFerramenta;
  },

  // Atualizar ferramenta
  updateFerramenta: (id: string, updates: Partial<Omit<LocalFerramenta, 'id' | 'created_at' | 'updated_at'>>): boolean => {
    const ferramentas = localFerramentasStorage.loadFerramentas();
    const index = ferramentas.findIndex(f => f.id === id);
    
    if (index !== -1) {
      ferramentas[index] = {
        ...ferramentas[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localFerramentasStorage.saveFerramentas(ferramentas);
      return true;
    }
    return false;
  },

  // Excluir ferramenta
  deleteFerramenta: (id: string): boolean => {
    const ferramentas = localFerramentasStorage.loadFerramentas();
    const filteredFerramentas = ferramentas.filter(f => f.id !== id);
    
    if (filteredFerramentas.length !== ferramentas.length) {
      localFerramentasStorage.saveFerramentas(filteredFerramentas);
      return true;
    }
    return false;
  },

  // Obter ferramentas por owner
  getFerramentasByOwner: (ownerId: string): LocalFerramenta[] => {
    const ferramentas = localFerramentasStorage.loadFerramentas();
    return ferramentas.filter(f => f.owner_id === ownerId);
  },
};
