import { useEffect, useState, useCallback } from 'react';
import { Building2, Wrench, AlertTriangle, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useRefresh } from '../../contexts/RefreshContext';
import { Obra, Ferramenta } from '../../types';
import { localObrasStorage } from '../../utils/localStorage';

export default function HomePage() {
  const { user } = useAuth();
  const { refreshTrigger } = useRefresh();
  const [obras, setObras] = useState<Obra[]>([]);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      if (!user?.id) {
        setObras([]);
        setFerramentas([]);
        setLoading(false);
        return;
      }

      const ownerId = user?.role === 'host' ? user.id : user?.host_id;

      // Tentar carregar obras do Supabase primeiro
      try {
        const obrasRes = await supabase
          .from('obras')
          .select('*')
          .eq('owner_id', ownerId)
          .eq('status', 'ativa')
          .order('created_at', { ascending: false });

        if (obrasRes.error) {
          console.warn('Erro ao carregar obras do Supabase, usando dados locais:', obrasRes.error);
          throw obrasRes.error;
        }
        
        setObras(obrasRes.data || []);
        console.log('✅ Obras carregadas do Supabase na Home');
      } catch {
        console.log('🔄 Usando dados locais como fallback na Home');
        
        // Fallback para dados locais
        const localObras = localObrasStorage.getObrasByOwner(ownerId || '');
        const obrasAtivas = localObras.filter(obra => obra.status === 'ativa');
        setObras(obrasAtivas);
        console.log('✅ Obras carregadas do localStorage na Home');
      }

      // Tentar carregar ferramentas do Supabase
      try {
        const ferramRes = await supabase
          .from('ferramentas')
          .select('*')
          .eq('owner_id', ownerId);

        if (ferramRes.error) {
          console.warn('Erro ao carregar ferramentas do Supabase:', ferramRes.error);
          throw ferramRes.error;
        }
        
        setFerramentas(ferramRes.data || []);
        console.log('✅ Ferramentas carregadas do Supabase na Home');
      } catch {
        console.log('🔄 Ferramentas não disponíveis localmente');
        setFerramentas([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

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
      label: 'Disponíveis',
      value: ferramentas.filter(f => f.status === 'disponivel').length,
      icon: Wrench,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      label: 'Desaparecidos',
      value: ferramentas.filter(f => f.status === 'desaparecida').length,
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
                obras.slice(0, 5).map((obra) => (
                  <div
                    key={obra.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
