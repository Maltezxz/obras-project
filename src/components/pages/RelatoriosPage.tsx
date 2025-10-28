import { useEffect, useState, useCallback } from 'react';
import { FileText, Download, Calendar, Wrench, User, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Movimentacao, Ferramenta, User as UserType, Obra, Estabelecimento } from '../../types';

interface MovimentacaoWithDetails extends Movimentacao {
  ferramenta?: Ferramenta;
  user?: UserType;
}

export default function RelatoriosPage() {
  const { user, getCompanyHostIds } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoWithDetails[]>([]);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [usuarios, setUsuarios] = useState<UserType[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    obra: '',
    ferramenta: '',
    usuario: '',
  });

  const loadData = useCallback(async () => {
    try {
      // Buscar IDs de todos os Hosts com mesmo CNPJ
      const hostIds = await getCompanyHostIds?.() || [user?.id].filter(Boolean);

      const [movRes, ferramRes, usersRes, obrasRes, estabRes] = await Promise.all([
        supabase
          .from('movimentacoes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('ferramentas').select('*').in('owner_id', hostIds),
        supabase.from('users').select('*'),
        supabase.from('obras').select('*').in('owner_id', hostIds),
        supabase.from('estabelecimentos').select('*').in('owner_id', hostIds),
      ]);

      if (movRes.data) {
        const movWithDetails = movRes.data.map(mov => {
          const ferramenta = ferramRes.data?.find(f => f.id === mov.ferramenta_id);
          const usuario = usersRes.data?.find(u => u.id === mov.user_id);
          return { ...mov, ferramenta, user: usuario };
        });
        setMovimentacoes(movWithDetails);
      }

      if (ferramRes.data) setFerramentas(ferramRes.data);
      if (usersRes.data) setUsuarios(usersRes.data);
      if (obrasRes.data) setObras(obrasRes.data);
      if (estabRes.data) setEstabelecimentos(estabRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getCompanyHostIds]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getLocationName = (type?: string, id?: string) => {
    if (!type || !id) return 'Sem localização';
    if (type === 'obra') {
      const obra = obras.find(o => o.id === id);
      return obra ? obra.title : 'Desconhecida';
    } else {
      const estab = estabelecimentos.find(e => e.id === id);
      return estab ? estab.name : 'Desconhecido';
    }
  };

  const filteredMovimentacoes = movimentacoes.filter(mov => {
    if (filters.startDate && new Date(mov.created_at) < new Date(filters.startDate)) return false;
    if (filters.endDate && new Date(mov.created_at) > new Date(filters.endDate)) return false;
    if (filters.obra && mov.to_type === 'obra' && mov.to_id !== filters.obra) return false;
    if (filters.ferramenta && mov.ferramenta_id !== filters.ferramenta) return false;
    if (filters.usuario && mov.user_id !== filters.usuario) return false;
    return true;
  });

  const exportToCSV = () => {
    if (filteredMovimentacoes.length === 0) {
      alert('Não há dados para exportar com os filtros aplicados.');
      return;
    }

    try {
      const headers = ['Data', 'Equipamento', 'Usuário', 'Origem', 'Destino', 'Observação'];
      const rows = filteredMovimentacoes.map(mov => [
        new Date(mov.created_at).toLocaleString('pt-BR'),
        mov.ferramenta?.name || 'N/A',
        mov.user?.name || 'N/A',
        mov.from_id ? getLocationName(mov.from_type, mov.from_id) : 'Cadastro inicial',
        getLocationName(mov.to_type, mov.to_id),
        mov.note || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio-movimentacoes-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      // Limpar o URL do objeto para liberar memória
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erro ao exportar arquivo CSV');
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
            Relatórios de Movimentação
          </h1>
          <p className="text-gray-400">
            Histórico completo de movimentações de equipamentos
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredMovimentacoes.length === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={20} />
          <span>Exportar CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Data Inicial
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Data Final
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Obra
          </label>
          <select
            value={filters.obra}
            onChange={(e) => setFilters({ ...filters, obra: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
          >
            <option value="" className="bg-gray-900">Todas</option>
            {obras.map((obra) => (
              <option key={obra.id} value={obra.id} className="bg-gray-900">
                {obra.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Equipamento
          </label>
          <select
            value={filters.ferramenta}
            onChange={(e) => setFilters({ ...filters, ferramenta: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
          >
            <option value="" className="bg-gray-900">Todos</option>
            {ferramentas.map((ferram) => (
              <option key={ferram.id} value={ferram.id} className="bg-gray-900">
                {ferram.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Usuário
          </label>
          <select
            value={filters.usuario}
            onChange={(e) => setFilters({ ...filters, usuario: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
          >
            <option value="" className="bg-gray-900">Todos</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id} className="bg-gray-900">
                {usuario.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="relative overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Equipamento
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Movimentação
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Observação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredMovimentacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">Nenhuma movimentação encontrada</p>
                  </td>
                </tr>
              ) : (
                filteredMovimentacoes.map((mov) => (
                  <tr key={mov.id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2 text-sm text-gray-300">
                        <Calendar size={16} className="text-gray-500" />
                        <span>{new Date(mov.created_at).toLocaleString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Wrench size={16} className="text-purple-400" />
                        <span className="text-sm text-white">{mov.ferramenta?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-blue-400" />
                        <span className="text-sm text-gray-300">{mov.user?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {mov.from_id && (
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <MapPin size={14} />
                            <span>De: {getLocationName(mov.from_type, mov.from_id)}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-green-400">
                          <MapPin size={14} />
                          <span>Para: {getLocationName(mov.to_type, mov.to_id)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-400">{mov.note || '-'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Total de movimentações: {filteredMovimentacoes.length}</span>
      </div>
    </div>
  );
}
