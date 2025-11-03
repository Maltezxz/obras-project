import { useEffect, useState, useCallback } from 'react';
import { Plus, Building2, Trash2, CheckCircle, XCircle, Calendar, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useRefresh } from '../../contexts/RefreshContext';
import { Obra } from '../../types';
import { fileToBase64 } from '../../utils/fileUtils';
import { getFilteredObras } from '../../utils/permissions';

export default function ObrasPage() {
  const { user, getCompanyHostIds } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    endereco: '',
    start_date: new Date().toISOString().split('T')[0],
    engenheiro: '',
    status: 'ativa' as 'ativa' | 'finalizada',
    image: null as File | null,
  });

  const loadObras = useCallback(async () => {
    try {
      if (!user?.id) {
        setObras([]);
        setLoading(false);
        return;
      }

      console.log('🔄 Carregando obras para:', user.name, user.role);

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
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .in('owner_id', ownerIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar obras do Supabase:', error);
        throw error;
      }

      const allObras = data || [];

      // HOSTS: mostram TUDO | FUNCIONÁRIOS: filtrar por permissões
      if (user.role === 'host') {
        setObras(allObras);
        console.log('✅ HOST vê todas as obras:', allObras.length);
      } else {
        const filteredObras = await getFilteredObras(user.id, user.role, user.host_id || null, allObras);
        setObras(filteredObras);
        console.log('✅ FUNCIONÁRIO vê obras filtradas:', filteredObras.length, 'de', allObras.length);
      }
    } catch (error) {
      console.error('Error loading obras:', error);
      setObras([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadObras();
  }, [loadObras]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }

      if (!formData.endereco.trim()) {
        throw new Error('Endereço é obrigatório');
      }

      if (!user?.id) {
        throw new Error('Usuário não identificado');
      }

      // Converter imagem para base64 se existir
      let imageBase64: string | undefined;
      if (formData.image) {
        try {
          imageBase64 = await fileToBase64(formData.image);
        } catch (error) {
          console.error('Erro ao converter imagem para base64:', error);
          throw new Error('Erro ao processar imagem');
        }
      }

      const obraData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        endereco: formData.endereco.trim(),
        start_date: formData.start_date,
        engenheiro: formData.engenheiro.trim(),
        status: formData.status,
        ...(imageBase64 && { image_url: imageBase64 }),
      };

      if (isEditing && editingId) {
        // Atualizar obra existente
        console.log('Atualizando obra com dados:', obraData);

        const { data, error } = await supabase
          .from('obras')
          .update(obraData)
          .eq('id', editingId)
          .select()
          .single();

        if (error) {
          console.error('Erro ao atualizar obra no Supabase:', error);
          throw new Error(`Erro ao atualizar obra: ${error.message}`);
        }

        console.log('✅ Obra atualizada no Supabase:', data);

        await supabase.from('historico').insert({
          tipo_evento: 'obra_atualizada',
          descricao: `Obra "${data.title}" foi atualizada`,
          obra_id: data.id,
          user_id: user.id,
          owner_id: user.id,
          metadata: {
            endereco: data.endereco,
            engenheiro: data.engenheiro,
          }
        });

        alert('Obra atualizada com sucesso!');
      } else {
        // Criar nova obra
        const newObraData = {
          ...obraData,
          owner_id: user.id,
        };

        console.log('Criando obra com dados:', newObraData);

        const { data, error } = await supabase
          .from('obras')
          .insert(newObraData)
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar obra no Supabase:', error);
          throw new Error(`Erro ao criar obra: ${error.message}`);
        }

        console.log('✅ Obra criada no Supabase:', data);

        await supabase.from('historico').insert({
          tipo_evento: 'obra_criada',
          descricao: `Obra "${data.title}" foi criada`,
          obra_id: data.id,
          user_id: user.id,
          owner_id: user.id,
          metadata: {
            endereco: data.endereco,
            engenheiro: data.engenheiro,
            start_date: data.start_date
          }
        });

        alert('Obra criada com sucesso!');
      }

      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        endereco: '',
        start_date: new Date().toISOString().split('T')[0],
        engenheiro: '',
        status: 'ativa' as 'ativa' | 'finalizada',
        image: null,
      });

      await loadObras();
      triggerRefresh();
    } catch (error: unknown) {
      console.error('Error saving obra:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar obra';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (obraId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativa' ? 'finalizada' : 'ativa';

    if (newStatus === 'finalizada') {
      if (!confirm('Tem certeza que deseja finalizar esta obra? Esta ação não pode ser desfeita.')) {
        return;
      }
    }

    try {
      const updateData = {
        status: newStatus as 'ativa' | 'finalizada',
        end_date: newStatus === 'finalizada' ? new Date().toISOString().split('T')[0] : null
      };

      const { error } = await supabase
        .from('obras')
        .update(updateData)
        .eq('id', obraId);

      if (error) {
        console.error('Erro ao atualizar obra no Supabase:', error);
        throw new Error(`Erro ao atualizar obra: ${error.message}`);
      }

      console.log('✅ Obra atualizada no Supabase');

      if (newStatus === 'finalizada') {
        const obra = obras.find(o => o.id === obraId);
        await supabase.from('historico').insert({
          tipo_evento: 'obra_finalizada',
          descricao: `Obra "${obra?.title}" foi finalizada`,
          obra_id: obraId,
          user_id: user?.id,
          owner_id: user?.id,
          metadata: {
            end_date: new Date().toISOString().split('T')[0],
            endereco: obra?.endereco
          }
        });
      }

      alert(`Obra ${newStatus === 'ativa' ? 'reativada' : 'finalizada'} com sucesso!`);

      await loadObras();
      triggerRefresh(); // Dispara atualização global
    } catch (error: unknown) {
      console.error('Error updating obra:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao atualizar obra';
      alert(errorMessage);
    }
  };

  const handleDelete = async (obraId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta obra? Todos os dados relacionados serão perdidos.')) return;

    try {
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', obraId);

      if (error) {
        console.error('Erro ao excluir obra do Supabase:', error);
        throw new Error(`Erro ao excluir obra: ${error.message}`);
      }

      console.log('✅ Obra excluída do Supabase');
      alert('Obra excluída com sucesso!');

      await loadObras();
      triggerRefresh(); // Dispara atualização global
    } catch (error: unknown) {
      console.error('Error deleting obra:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao excluir obra';
      alert(errorMessage);
    }
  };

  if (loading && obras.length === 0) {
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
            Gerenciamento de Obras
          </h1>
          <p className="text-gray-400">
            Cadastre e gerencie suas obras
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
        >
          <Plus size={20} />
          <span>Nova Obra</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {obras.map((obra) => (
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setEditingId(obra.id);
                      setFormData({
                        title: obra.title,
                        description: obra.description || '',
                        endereco: obra.endereco,
                        start_date: obra.start_date,
                        engenheiro: obra.engenheiro || '',
                        status: obra.status,
                        image: null,
                      });
                      setShowModal(true);
                    }}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                    title="Editar obra"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => toggleStatus(obra.id, obra.status)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      obra.status === 'ativa'
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    }`}
                    title={obra.status === 'ativa' ? 'Finalizar obra' : 'Reativar obra'}
                  >
                    {obra.status === 'ativa' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(obra.id)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
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
                  <Building2 size={16} className="mt-0.5 flex-shrink-0" />
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
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    obra.status === 'ativa'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  {obra.status === 'ativa' ? 'Ativa' : 'Finalizada'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {obras.length === 0 && (
        <div className="text-center py-20">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Nenhuma obra cadastrada
          </h3>
          <p className="text-gray-500 mb-6">
            Comece adicionando sua primeira obra
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm modal-backdrop-enter">
          <div className="relative w-full max-w-lg modal-enter">
            {/* Main Modal Container */}
            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {isEditing ? 'Editar Obra' : 'Nova Obra'}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {isEditing ? 'Atualize os dados da obra' : 'Cadastre uma nova obra'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setIsEditing(false);
                      setEditingId(null);
                      setFormData({
                        title: '',
                        description: '',
                        endereco: '',
                        start_date: new Date().toISOString().split('T')[0],
                        engenheiro: '',
                        status: 'ativa' as 'ativa' | 'finalizada',
                        image: null,
                      });
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nome da Obra */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Nome da Obra *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Digite o nome da obra"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                    required
                  />
                </div>

                {/* Engenheiro da Obra */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Engenheiro da Obra *
                  </label>
                  <input
                    type="text"
                    value={formData.engenheiro}
                    onChange={(e) => setFormData({ ...formData, engenheiro: e.target.value })}
                    placeholder="Nome do engenheiro responsável"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    required
                  />
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Digite o endereço completo"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                    required
                  />
                </div>

                {/* Situação da Obra */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Situação da Obra *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ativa' | 'finalizada' })}
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    required
                  >
                    <option value="ativa">Ativa</option>
                    <option value="finalizada">Concluída</option>
                  </select>
                </div>

                {/* Upload de Imagem */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Imagem da Obra
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                      className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-500 file:text-white hover:file:bg-red-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    />
                    {formData.image && (
                      <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 text-sm">✓ {formData.image.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setIsEditing(false);
                      setEditingId(null);
                      setFormData({
                        title: '',
                        description: '',
                        endereco: '',
                        start_date: new Date().toISOString().split('T')[0],
                        engenheiro: '',
                        status: 'ativa' as 'ativa' | 'finalizada',
                        image: null,
                      });
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        <span>Salvar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
