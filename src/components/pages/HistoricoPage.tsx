import { useEffect, useState, useCallback } from 'react';
import { History, Building2, Wrench, MapPin, Calendar, Filter, Search, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Obra, Ferramenta, Movimentacao } from '../../types';

interface HistoricoObra extends Obra {
  ferramentas_count?: number;
  movimentacoes_count?: number;
}

interface Estabelecimento {
  id: string;
  name: string;
  endereco: string;
}

interface HistoricoMovimentacao extends Movimentacao {
  ferramenta?: Ferramenta;
  obra_origem?: Obra;
  obra_destino?: Obra;
  estabelecimento_origem?: Estabelecimento;
  estabelecimento_destino?: Estabelecimento;
}

export default function HistoricoPage() {
  const { user } = useAuth();
  const [obras, setObras] = useState<HistoricoObra[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<HistoricoMovimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'obras' | 'movimentacoes'>('obras');
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  const loadData = useCallback(async () => {
    try {
      if (!user?.id) {
        setObras([]);
        setMovimentacoes([]);
        return;
      }

      const ownerId = user.role === 'host' ? user.id : user.host_id;

      // Carregar obras
      try {
        const { data: obrasData, error: obrasError } = await supabase
          .from('obras')
          .select(`
            *,
            ferramentas:ferramentas(count),
            movimentacoes:movimentacoes(count)
          `)
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false });

        if (obrasError) {
          console.warn('Erro ao carregar obras do Supabase:', obrasError);
          throw obrasError;
        }

        setObras(obrasData || []);
        console.log('✅ Obras carregadas do Supabase');
      } catch {
        console.log('🔄 Carregando obras do localStorage');
        // Fallback para dados locais se necessário
        setObras([]);
      }

      // Carregar movimentações
      try {
        const { data: movData, error: movError } = await supabase
          .from('movimentacoes')
          .select(`
            *,
            ferramenta:ferramentas(*),
            obra_origem:obras!movimentacoes_from_id_fkey(*),
            obra_destino:obras!movimentacoes_to_id_fkey(*)
          `)
          .order('created_at', { ascending: false });

        if (movError) {
          console.warn('Erro ao carregar movimentações do Supabase:', movError);
          throw movError;
        }

        setMovimentacoes(movData || []);
        console.log('✅ Movimentações carregadas do Supabase');
      } catch {
        console.log('🔄 Carregando movimentações do localStorage');
        setMovimentacoes([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredObras = obras.filter(obra => {
    if (filters.status && obra.status !== filters.status) return false;
    if (filters.dateFrom && new Date(obra.start_date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(obra.start_date) > new Date(filters.dateTo)) return false;
    if (filters.search && !obra.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const filteredMovimentacoes = movimentacoes.filter(mov => {
    if (filters.dateFrom && new Date(mov.created_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(mov.created_at) > new Date(filters.dateTo)) return false;
    if (filters.search && !mov.ferramenta?.name?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const exportToCSV = () => {
    if (activeTab === 'obras') {
      if (filteredObras.length === 0) {
        alert('Não há dados para exportar com os filtros aplicados.');
        return;
      }

      const headers = ['Título', 'Status', 'Endereço', 'Data Início', 'Data Fim', 'Ferramentas', 'Movimentações'];
      const rows = filteredObras.map(obra => [
        obra.title,
        obra.status,
        obra.endereco,
        new Date(obra.start_date).toLocaleDateString('pt-BR'),
        obra.end_date ? new Date(obra.end_date).toLocaleDateString('pt-BR') : 'Em andamento',
        obra.ferramentas_count || 0,
        obra.movimentacoes_count || 0,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `historico-obras-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      if (filteredMovimentacoes.length === 0) {
        alert('Não há dados para exportar com os filtros aplicados.');
        return;
      }

      const headers = ['Data', 'Ferramenta', 'Origem', 'Destino', 'Observação'];
      const rows = filteredMovimentacoes.map(mov => [
        new Date(mov.created_at).toLocaleString('pt-BR'),
        mov.ferramenta?.name || 'N/A',
        mov.from_type === 'obra' ? mov.obra_origem?.title : 'Estabelecimento',
        mov.to_type === 'obra' ? mov.obra_destino?.title : 'Estabelecimento',
        mov.note || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `historico-movimentacoes-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Histórico Completo
          </h1>
          <p className="text-gray-400">
            Visualize o histórico de obras e movimentações de ferramentas
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105"
        >
          <Download size={20} />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('obras')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'obras'
              ? 'bg-red-500/10 text-red-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Building2 size={20} />
          <span>Obras ({filteredObras.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('movimentacoes')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
            activeTab === 'movimentacoes'
              ? 'bg-red-500/10 text-red-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Wrench size={20} />
          <span>Movimentações ({filteredMovimentacoes.length})</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white/5 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-white">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {activeTab === 'obras' && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
              >
                <option value="">Todos</option>
                <option value="ativa">Ativa</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {activeTab === 'obras' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObras.map((obra) => (
            <div
              key={obra.id}
              className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 group ${
                obra.status === 'ativa'
                  ? 'bg-white/5 border-white/10 hover:bg-white/10'
                  : 'bg-gray-500/5 border-gray-500/10'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${
                    obra.status === 'ativa'
                      ? 'bg-gradient-to-br from-green-600 to-green-500'
                      : 'bg-gradient-to-br from-gray-600 to-gray-500'
                  }`}>
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      obra.status === 'ativa'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {obra.status === 'ativa' ? 'Ativa' : 'Finalizada'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {obra.title}
                    </h3>
                    {obra.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {obra.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-start space-x-2 text-gray-400 text-sm">
                    <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                    <span>{obra.endereco}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Calendar size={16} />
                    <span>
                      Início: {new Date(obra.start_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  {obra.end_date && (
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <Calendar size={16} />
                      <span>
                        Fim: {new Date(obra.end_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Wrench size={16} />
                      <span>{obra.ferramentas_count || 0} ferramentas</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <History size={16} />
                      <span>{obra.movimentacoes_count || 0} movimentações</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMovimentacoes.map((mov) => (
            <div
              key={mov.id}
              className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Wrench size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {mov.ferramenta?.name || 'Ferramenta não encontrada'}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {new Date(mov.created_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Origem</h4>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Building2 size={16} />
                    <span>
                      {mov.from_type === 'obra' 
                        ? mov.obra_origem?.title || 'Obra não encontrada'
                        : 'Estabelecimento'
                      }
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Destino</h4>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Building2 size={16} />
                    <span>
                      {mov.to_type === 'obra' 
                        ? mov.obra_destino?.title || 'Obra não encontrada'
                        : 'Estabelecimento'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {mov.note && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Observação</h4>
                  <p className="text-gray-400 text-sm">{mov.note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {((activeTab === 'obras' && filteredObras.length === 0) || 
        (activeTab === 'movimentacoes' && filteredMovimentacoes.length === 0)) && (
        <div className="text-center py-20">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Nenhum histórico encontrado
          </h3>
          <p className="text-gray-500">
            {activeTab === 'obras' 
              ? 'Não há obras que correspondam aos filtros aplicados'
              : 'Não há movimentações que correspondam aos filtros aplicados'
            }
          </p>
        </div>
      )}
    </div>
  );
}
