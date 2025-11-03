import { useEffect, useState, useCallback } from 'react';
import { Building2, Wrench, AlertTriangle, TrendingUp, Clock, Plus, Edit, CheckCircle, Trash2, MoveRight, MapPin, PackageMinus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useRefresh } from '../../contexts/RefreshContext';
import { Obra, Ferramenta } from '../../types';
import { getFilteredObras, getFilteredFerramentas } from '../../utils/permissions';

export default function HomePage() {
  const { user, getCompanyHostIds } = useAuth();
  const { refreshTrigger } = useRefresh();
  const [obras, setObras] = useState<Obra[]>([]);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [atividadesRecentes, setAtividadesRecentes] = useState<any[]>([]);

  const getEquipmentCountByObra = (obraId: string) => {
    return ferramentas.filter(f => f.current_id === obraId && f.current_type === 'obra').length;
  };

  const getActivityIcon = (tipoEvento: string) => {
    switch (tipoEvento) {
      case 'obra_criada':
        return { Icon: Plus, color: 'text-green-400', bg: 'bg-green-500/10' };
      case 'obra_editada':
        return { Icon: Edit, color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'obra_finalizada':
        return { Icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' };
      case 'movimentacao':
        return { Icon: MoveRight, color: 'text-orange-400', bg: 'bg-orange-500/10' };
      case 'ferramenta_criada':
        return { Icon: Wrench, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'ferramenta_editada':
        return { Icon: Edit, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
      case 'ferramenta_removida':
        return { Icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'desaparecimento':
        return { Icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
      case 'localizacao_atualizada':
        return { Icon: MapPin, color: 'text-indigo-400', bg: 'bg-indigo-500/10' };
      default:
        return { Icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month} - ${hours}:${minutes}`;
  };

  const loadData = useCallback(async () => {
    try {
      if (!user?.id) {
        setObras([]);
        setFerramentas([]);
        setLoading(false);
        return;
      }

      console.log('🔄 Carregando dados da Home para:', user.name, user.role);

      let ownerIds: string[] = [];

      // Para HOSTS: buscar TODOS os hosts do mesmo CNPJ (todos veem a mesma coisa)
      if (user.role === 'host') {
        const { data: hosts, error: hostsError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'host')
          .eq('cnpj', user.cnpj);

        if (hostsError) {
          console.error('Erro ao buscar hosts:', hostsError);
          ownerIds = [user.id];
        } else {
          ownerIds = hosts?.map(h => h.id) || [user.id];
        }
        console.log('📊 Host Owner IDs:', ownerIds);
      } else {
        // Para FUNCIONÁRIOS: usar apenas o host_id dele
        ownerIds = user.host_id ? [user.host_id] : [];
      }

      if (ownerIds.length === 0) {
        setObras([]);
        setFerramentas([]);
        setLoading(false);
        return;
      }

      // BUSCAR OBRAS
      const obrasRes = await supabase
        .from('obras')
        .select('*')
        .in('owner_id', ownerIds)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false });

      if (obrasRes.error) {
        console.error('Erro ao carregar obras:', obrasRes.error);
      } else {
        const allObras = obrasRes.data || [];

        // HOSTS: mostram TUDO | FUNCIONÁRIOS: filtrar por permissões
        if (user.role === 'host') {
          setObras(allObras);
          console.log('✅ HOST vê todas as obras:', allObras.length);
        } else {
          const filteredObras = await getFilteredObras(user.id, user.role, user.host_id, allObras);
          setObras(filteredObras);
          console.log('✅ FUNCIONÁRIO vê obras filtradas:', filteredObras.length, 'de', allObras.length);
        }
      }

      // BUSCAR FERRAMENTAS - SEM image_url e nf_image_url para evitar timeout com imagens grandes
      console.log('🔍 Buscando ferramentas com owner_ids:', ownerIds);
      const ferramRes = await supabase
        .from('ferramentas')
        .select('id, name, modelo, serial, status, current_type, current_id, cadastrado_por, owner_id, created_at')
        .in('owner_id', ownerIds);

      if (ferramRes.error) {
        console.error('❌ Erro ao carregar ferramentas:', ferramRes.error);
      } else {
        const allFerramentas = ferramRes.data || [];
        console.log('📦 Ferramentas retornadas do banco:', allFerramentas.length, allFerramentas);

        // HOSTS: mostram TUDO | FUNCIONÁRIOS: filtrar por permissões
        if (user.role === 'host') {
          setFerramentas(allFerramentas);
          console.log('✅ HOST vê todas as ferramentas:', allFerramentas.length);
          console.log('📊 Por status:', {
            disponiveis: allFerramentas.filter(f => f.status === 'disponivel').length,
            em_uso: allFerramentas.filter(f => f.status === 'em_uso').length,
            desaparecidas: allFerramentas.filter(f => f.status === 'desaparecida').length,
            total_nao_desaparecidas: allFerramentas.filter(f => f.status !== 'desaparecida').length
          });
        } else {
          const filteredFerramentas = await getFilteredFerramentas(user.id, user.role, user.host_id || null, allFerramentas);
          setFerramentas(filteredFerramentas);
          console.log('✅ FUNCIONÁRIO vê ferramentas filtradas:', filteredFerramentas.length, 'de', allFerramentas.length);
        }
      }

      // BUSCAR HISTÓRICO
      const historicoRes = await supabase
        .from('historico')
        .select('*')
        .in('owner_id', ownerIds)
        .order('created_at', { ascending: false })
        .limit(5);

      if (historicoRes.error) {
        console.error('Erro ao carregar histórico:', historicoRes.error);
      } else {
        setAtividadesRecentes(historicoRes.data || []);
        console.log('✅ Atividades recentes carregadas:', historicoRes.data?.length || 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();

    // Configurar realtime para atividades recentes
    const historicoChannel = supabase
      .channel('historico-home-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'historico',
        },
        (payload) => {
          console.log('📡 Atualização em tempo real no histórico:', payload);
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(historicoChannel);
    };
  }, [loadData, refreshTrigger]);

  const totalEquipamentos = ferramentas.filter(f => f.status !== 'desaparecida').length;
  const totalDesaparecidos = ferramentas.filter(f => f.status === 'desaparecida').length;

  console.log('📊 RENDER HomePage - Stats:', {
    obras: obras.length,
    ferramentas_total: ferramentas.length,
    equipamentos: totalEquipamentos,
    desaparecidos: totalDesaparecidos,
    user: user?.name,
    role: user?.role
  });

  const stats = [
    {
      label: 'Obras Ativas',
      value: obras.length,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      label: 'Equipamentos',
      value: totalEquipamentos,
      icon: Wrench,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
    },
    {
      label: 'Desaparecidos',
      value: totalDesaparecidos,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
    },
  ];

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
            Bem-vindo, {user?.name}
          </h1>
          <p className="text-gray-400">
            Visão geral das suas operações
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`relative group overflow-hidden rounded-2xl ${stat.bgColor} border ${stat.borderColor} backdrop-blur-xl transition-all duration-300 hover:scale-105`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-gray-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Obras Ativas</h2>
              <Building2 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {obras.length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">
                  Nenhuma obra ativa
                </p>
              ) : (
                obras.slice(0, 5).map((obra) => {
                  const equipmentCount = getEquipmentCountByObra(obra.id);
                  return (
                    <div
                      key={obra.id}
                      className="relative p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
                    >
                      {obra.image_url && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img
                            src={obra.image_url}
                            alt={obra.title}
                            className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      )}
                      <h3 className="text-white font-medium mb-1 group-hover:text-red-400 transition-colors">
                        {obra.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{obra.endereco}</p>
                      {obra.engenheiro && (
                        <p className="text-gray-500 text-xs mt-1">
                          Eng: {obra.engenheiro}
                        </p>
                      )}
                      <div className="absolute bottom-3 right-3 flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm">
                        <Wrench className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-bold text-white">{equipmentCount}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Atividades Recentes</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
              {atividadesRecentes.length === 0 ? (
                <p className="text-gray-400 text-sm py-8 text-center">
                  Nenhuma atividade recente
                </p>
              ) : (
                atividadesRecentes.map((atividade, index) => {
                  const { Icon, color, bg } = getActivityIcon(atividade.tipo_evento);
                  return (
                    <div
                      key={atividade.id}
                      className="relative p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group animate-fade-in"
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm leading-relaxed">
                            {atividade.descricao}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-500">
                              {formatDateTime(atividade.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
