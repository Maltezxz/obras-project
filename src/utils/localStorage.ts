// Utilitário para gerenciar dados locais quando Supabase não estiver disponível

export interface LocalObra {
  id: string;
  title: string;
  description: string;
  endereco: string;
  start_date: string;
  end_date?: string | null;
  status: 'ativa' | 'finalizada';
  owner_id: string;
  engenheiro?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'obrasflow_obras';

export const localObrasStorage = {
  // Salvar obras no localStorage
  saveObras: (obras: LocalObra[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obras));
    } catch (error) {
      console.error('Erro ao salvar obras no localStorage:', error);
    }
  },

  // Carregar obras do localStorage
  loadObras: (): LocalObra[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao carregar obras do localStorage:', error);
      return [];
    }
  },

  // Adicionar nova obra
  addObra: (obra: Omit<LocalObra, 'id' | 'created_at' | 'updated_at'>): LocalObra => {
    const obras = localObrasStorage.loadObras();
    const newObra: LocalObra = {
      ...obra,
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    const updatedObras = [...obras, newObra];
    localObrasStorage.saveObras(updatedObras);
    return newObra;
  },

  // Atualizar obra
  updateObra: (id: string, updates: Partial<Omit<LocalObra, 'id' | 'created_at' | 'updated_at'>>): boolean => {
    const obras = localObrasStorage.loadObras();
    const index = obras.findIndex(obra => obra.id === id);
    
    if (index === -1) return false;
    
    obras[index] = {
      ...obras[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    localObrasStorage.saveObras(obras);
    return true;
  },

  // Deletar obra
  deleteObra: (id: string): boolean => {
    const obras = localObrasStorage.loadObras();
    const filteredObras = obras.filter(obra => obra.id !== id);
    
    if (filteredObras.length === obras.length) return false;
    
    localObrasStorage.saveObras(filteredObras);
    return true;
  },

  // Filtrar obras por owner_id
  getObrasByOwner: (ownerId: string): LocalObra[] => {
    const obras = localObrasStorage.loadObras();
    return obras.filter(obra => obra.owner_id === ownerId);
  }
};
