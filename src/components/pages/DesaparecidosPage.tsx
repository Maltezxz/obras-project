import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Ferramenta, Obra, Estabelecimento } from '../../types';

export default function DesaparecidosPage() {
  const { user, getCompanyHostIds } = useAuth();
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      let ownerIds: string[] = [];

      if (user?.role === 'host') {
        ownerIds = await getCompanyHostIds?.() || [user.id];
      } else {
        ownerIds = user?.host_id ? [user.host_id] : [];
      }

      if (ownerIds.length === 0) {
        setFerramentas([]);
        setObras([]);
        setEstabelecimentos([]);
        setLoading(false);
        return;
      }

      const [ferramRes, obrasRes, estabRes] = await Promise.all([
        supabase
          .from('ferramentas')
          .select('*')
          .in('owner_id', ownerIds)
          .eq('status', 'desaparecida')
          .order('updated_at', { ascending: false }),
        supabase.from('obras').select('*').in('owner_id', ownerIds),
        supabase.from('estabelecimentos').select('*').in('owner_id', ownerIds),
      ]);

      if (ferramRes.data) setFerramentas(ferramRes.data);
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

  const markAsFound = async (ferramenta: Ferramenta) => {
    if (!confirm(`Tem certeza que deseja marcar "${ferramenta.name}" como encontrado?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ferramentas')
        .update({ status: 'em_uso' })
        .eq('id', ferramenta.id);

      if (error) throw error;
      await loadData();
      alert('Equipamento marcado como encontrado com sucesso!');
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao atualizar status: ${errorMessage}`);
    }
  };

  const getLocationName = (type?: string, id?: string) => {
    if (!type || !id) return 'Sem localização';
    if (type === 'obra') {
      const obra = obras.find(o => o.id === id);
      return obra ? obra.title : 'Obra desconhecida';
    } else {
      const estab = estabelecimentos.find(e => e.id === id);
      return estab ? estab.name : 'Estabelecimento desconhecido';
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
            Equipamentos Desaparecidos
          </h1>
          <p className="text-gray-400">
            Gerencie equipamentos marcados como desaparecidos
          </p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-semibold">{ferramentas.length}</span>
          <span className="text-gray-400 text-sm">desaparecidos</span>
        </div>
      </div>

      {ferramentas.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Nenhum equipamento desaparecido
          </h3>
          <p className="text-gray-500">
            Todos os seus equipamentos estão localizados
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ferramentas.map((ferramenta) => (
            <div
              key={ferramenta.id}
              className="relative overflow-hidden rounded-2xl bg-red-500/5 border border-red-500/20 backdrop-blur-xl transition-all duration-300 group hover:bg-red-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-red-500">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <button
                    onClick={() => markAsFound(ferramenta)}
                    className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all duration-200"
                    title="Marcar como encontrado"
                  >
                    <CheckCircle size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {ferramenta.name}
                    </h3>
                    {ferramenta.modelo && (
                      <p className="text-gray-400 text-sm">
                        Modelo: {ferramenta.modelo}
                      </p>
                    )}
                    {ferramenta.serial && (
                      <p className="text-gray-400 text-sm">
                        Serial: {ferramenta.serial}
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Última localização</p>
                    <p className="text-sm text-white">
                      {getLocationName(ferramenta.current_type, ferramenta.current_id)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-red-500/20">
                  <p className="text-xs text-gray-500">
                    Atualizado em {new Date(ferramenta.updated_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
