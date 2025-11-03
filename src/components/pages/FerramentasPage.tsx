import { useEffect, useState, useCallback } from 'react';
import { Plus, Wrench, Trash2, ArrowRight, Package, XCircle, Image as ImageIcon, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { useRefresh } from '../../contexts/RefreshContext';
import { Ferramenta, Obra } from '../../types';
import { fileToBase64 } from '../../utils/fileUtils';
import { getFilteredObras, getFilteredFerramentas } from '../../utils/permissions';
import { FerramentaImage } from '../FerramentaImage';

export default function FerramentasPage() {
  const { user, getCompanyHostIds } = useAuth();
  const { isHost, canCreateFerramentas, canDeleteFerramentas, canTransferFerramentas, canMarkDesaparecida } = usePermissions();
  const { triggerRefresh } = useRefresh();
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedFerramenta, setSelectedFerramenta] = useState<Ferramenta | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    tipo: '',
    modelo: '',
    serial: '',
    current_type: 'obra',
    current_id: '',
    // Novos campos
    descricao: '',
    nf: '',
    nf_image: null as File | null,
    tool_image: null as File | null,
    data: '',
    valor: '',
    tempo_garantia_dias: '',
    garantia: '',
    marca: '',
    numero_lacre: '',
    numero_placa: '',
    adesivo: '',
    usuario: '',
    obra: '',
  });
  const [moveData, setMoveData] = useState({
    to_type: 'obra',
    to_id: '',
    note: '',
  });

  const loadData = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    try {
      if (!user?.id) {
        console.log('⚠️ Usuário não identificado, limpando dados');
        setFerramentas([]);
        setObras([]);
        setLoading(false);
        return;
      }

      console.log(`🔄 [TENTATIVA ${retryCount + 1}] Carregando ferramentas para:`, user.name, user.role, user.id);

      let ownerIds: string[] = [];

      // Para HOSTS: buscar TODOS os hosts do mesmo CNPJ (todos veem a mesma coisa)
      if (user.role === 'host') {
        const { data: hosts, error: hostsError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'host')
          .eq('cnpj', user.cnpj);

        if (hostsError) {
          console.error('❌ Erro ao buscar hosts:', hostsError);
          ownerIds = [user.id];
        } else {
          ownerIds = hosts?.map(h => h.id) || [user.id];
        }
        console.log('📊 HOST Owner IDs:', ownerIds);
      } else {
        // Para FUNCIONÁRIOS: usar apenas o host_id dele
        ownerIds = user.host_id ? [user.host_id] : [];
        console.log('📊 FUNCIONÁRIO Owner IDs:', ownerIds);
      }

      if (ownerIds.length === 0) {
        console.warn('⚠️ Nenhum owner_id encontrado, limpando dados');
        setFerramentas([]);
        setObras([]);
        setLoading(false);
        return;
      }

      // BUSCAR FERRAMENTAS COM TIMEOUT
      console.log('🔍 Buscando ferramentas no Supabase com owner_ids:', ownerIds);

      const ferramentasPromise = supabase
        .from('ferramentas')
        .select('id, name, modelo, serial, status, current_type, current_id, cadastrado_por, owner_id, descricao, nf, nf_image_url, data, valor, tempo_garantia_dias, garantia, marca, numero_lacre, numero_placa, adesivo, usuario, obra, created_at, updated_at, tipo')
        .in('owner_id', ownerIds)
        .order('created_at', { ascending: false });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao buscar ferramentas')), 10000)
      );

      const { data: ferramentasData, error: ferramError } = await Promise.race([
        ferramentasPromise,
        timeoutPromise
      ]) as any;

      if (ferramError) {
        console.error('❌ Erro ao carregar ferramentas:', ferramError);

        // RETRY automático se não for a última tentativa
        if (retryCount < MAX_RETRIES) {
          console.log(`🔄 Tentando novamente em 2 segundos... (${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => loadData(retryCount + 1), 2000);
          return;
        }

        console.error('❌ Falha após todas as tentativas');
        alert('Erro ao carregar equipamentos. Verifique sua conexão e tente novamente.');
      } else {
        const allFerramentas = ferramentasData || [];
        console.log('📦 Ferramentas retornadas do banco:', allFerramentas.length);

        // HOSTS: mostram TUDO | FUNCIONÁRIOS: filtrar por permissões
        if (user.role === 'host') {
          setFerramentas(allFerramentas);
          console.log('✅ HOST vê todas as ferramentas:', allFerramentas.length);
        } else {
          const filteredFerramentas = await getFilteredFerramentas(user.id, user.role, user.host_id || null, allFerramentas);
          setFerramentas(filteredFerramentas);
          console.log('✅ FUNCIONÁRIO vê ferramentas filtradas:', filteredFerramentas.length, 'de', allFerramentas.length);
        }
      }

      // BUSCAR OBRAS
      console.log('🔍 Buscando obras no Supabase');
      const { data: obrasData, error: obrasError } = await supabase
        .from('obras')
        .select('*')
        .in('owner_id', ownerIds)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false });

      if (obrasError) {
        console.error('❌ Erro ao carregar obras:', obrasError);
      } else {
        const allObras = obrasData || [];
        console.log('🏗️ Obras retornadas do banco:', allObras.length);

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

    } catch (error) {
      console.error('❌ Erro geral ao carregar dados:', error);

      // RETRY automático se não for a última tentativa
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Tentando novamente em 2 segundos... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => loadData(retryCount + 1), 2000);
        return;
      }

      alert('Erro ao conectar com o servidor. Verifique sua internet e recarregue a página.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error('Usuário não identificado');
      }

      const ownerId = user?.role === 'host' ? user.id : user?.host_id;

      // Converter imagem da NF para base64 se existir
      let nfImageBase64: string | undefined;
      if (formData.nf_image) {
        try {
          nfImageBase64 = await fileToBase64(formData.nf_image);
        } catch (error) {
          console.error('Erro ao converter imagem da NF para base64:', error);
          throw new Error('Erro ao processar imagem da NF');
        }
      }

      // Converter imagem da ferramenta para base64 se existir
      let toolImageBase64: string | undefined;
      if (formData.tool_image) {
        try {
          toolImageBase64 = await fileToBase64(formData.tool_image);
        } catch (error) {
          console.error('Erro ao converter imagem da ferramenta para base64:', error);
          throw new Error('Erro ao processar imagem da ferramenta');
        }
      }

      const initialStatus: 'em_uso' | 'disponivel' = formData.current_id ? 'em_uso' : 'disponivel';

      const ferramentaData: any = {
        name: formData.name.trim(),
        tipo: formData.tipo.trim() || undefined,
        modelo: formData.modelo.trim(),
        serial: formData.serial.trim(),
        current_type: formData.current_id ? 'obra' : undefined,
        current_id: formData.current_id || undefined,
        status: initialStatus,
        // Novos campos
        descricao: formData.descricao.trim() || undefined,
        nf: formData.nf.trim() || undefined,
        nf_image_url: nfImageBase64,
        image_url: toolImageBase64,
        data: formData.data || undefined,
        valor: formData.valor ? parseFloat(formData.valor.replace(',', '.')) : undefined,
        tempo_garantia_dias: formData.tempo_garantia_dias ? parseInt(formData.tempo_garantia_dias) : undefined,
        garantia: formData.garantia.trim() || undefined,
        marca: formData.marca.trim() || undefined,
        numero_lacre: formData.numero_lacre.trim() || undefined,
        numero_placa: formData.numero_placa.trim() || undefined,
        adesivo: formData.adesivo.trim() || undefined,
        usuario: formData.usuario.trim() || undefined,
        obra: formData.obra.trim() || undefined,
      };

      if (!isEditing) {
        ferramentaData.cadastrado_por = user.id;
        ferramentaData.owner_id = ownerId;
      }

      console.log(isEditing ? 'Atualizando ferramenta com dados:' : 'Criando ferramenta com dados:', ferramentaData);

      try {
        if (isEditing && editingId) {
          // Atualizar ferramenta existente
          const { error: updateError } = await supabase
            .from('ferramentas')
            .update(ferramentaData)
            .eq('id', editingId);

          if (updateError) {
            console.error('Erro do Supabase ao atualizar:', updateError);
            throw updateError;
          }

          console.log('✅ Ferramenta atualizada no Supabase');
          alert('Equipamento atualizado com sucesso!');
        } else {
          // Criar nova ferramenta
          const { data: newFerramenta, error: ferramError } = await supabase
            .from('ferramentas')
            .insert(ferramentaData)
            .select()
            .single();

          if (ferramError) {
            console.warn('Erro do Supabase, salvando localmente:', ferramError);
            throw ferramError;
          }

          if (formData.current_id) {
            const { data: movData } = await supabase.from('movimentacoes').insert({
              ferramenta_id: newFerramenta.id,
              to_type: 'obra',
              to_id: formData.current_id,
              user_id: user.id,
              note: 'Cadastro inicial',
            }).select().single();

            const obraInicial = obras.find(o => o.id === formData.current_id);
            await supabase.from('historico').insert({
              tipo_evento: 'movimentacao',
              descricao: `Equipamento "${formData.name}" cadastrado em ${obraInicial?.title || 'obra'}`,
              movimentacao_id: movData?.id,
              user_id: user.id,
              owner_id: user.id,
              metadata: {
                ferramenta_nome: formData.name,
                obra: obraInicial?.title || 'obra',
                observacao: 'Cadastro inicial'
              }
            });
          }

          console.log('✅ Ferramenta criada no Supabase');
          alert('Equipamento criado com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao salvar ferramenta:', error);
        throw error;
      }

      setShowModal(false);
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        name: '',
        tipo: '',
        modelo: '',
        serial: '',
        current_type: 'obra',
        current_id: '',
        descricao: '',
        nf: '',
        nf_image: null,
        tool_image: null,
        data: '',
        valor: '',
        tempo_garantia_dias: '',
        garantia: '',
        marca: '',
        numero_lacre: '',
        numero_placa: '',
        adesivo: '',
        usuario: '',
        obra: '',
      });

      await loadData();
      triggerRefresh();
    } catch (error: unknown) {
      console.error('Error saving ferramenta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar ferramenta';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFerramenta) return;

    setLoading(true);

    try {
      const obraDestino = obras.find(o => o.id === moveData.to_id);

      const { error: updateError } = await supabase
        .from('ferramentas')
        .update({
          current_type: moveData.to_type,
          current_id: moveData.to_id,
          status: 'em_uso',
        })
        .eq('id', selectedFerramenta.id);

      if (updateError) throw updateError;

      const { data: movData, error: movError } = await supabase.from('movimentacoes').insert({
        ferramenta_id: selectedFerramenta.id,
        from_type: selectedFerramenta.current_type,
        from_id: selectedFerramenta.current_id,
        to_type: moveData.to_type,
        to_id: moveData.to_id,
        user_id: user?.id,
        note: moveData.note || `Movido para ${obraDestino?.title || 'obra'}`,
      }).select().single();

      if (movError) throw movError;

      await supabase.from('historico').insert({
        tipo_evento: 'movimentacao',
        descricao: `Equipamento "${selectedFerramenta.name}" movido para ${obraDestino?.title || 'obra'}`,
        movimentacao_id: movData?.id,
        user_id: user?.id,
        owner_id: user?.id,
        metadata: {
          ferramenta_nome: selectedFerramenta.name,
          destino: obraDestino?.title || 'obra',
          observacao: moveData.note || ''
        }
      });

      alert(`Equipamento movido para ${obraDestino?.title || 'obra'} com sucesso!`);

      setShowMoveModal(false);
      setSelectedFerramenta(null);
      setMoveData({ to_type: 'obra', to_id: '', note: '' });
      await loadData();
      triggerRefresh();
    } catch (error: unknown) {
      console.error('Error moving ferramenta:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao mover equipamento';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este equipamento?')) return;

    try {
      const { error } = await supabase
        .from('ferramentas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error('Error deleting ferramenta:', error);
      alert('Erro ao excluir equipamento');
    }
  };

  const toggleStatus = async (ferramenta: Ferramenta) => {
    const newStatus = ferramenta.status === 'desaparecida' ? 'em_uso' : 'desaparecida';

    try {
      const { error } = await supabase
        .from('ferramentas')
        .update({ status: newStatus })
        .eq('id', ferramenta.id);

      if (error) throw error;

      if (newStatus === 'desaparecida') {
        await supabase.from('historico').insert({
          tipo_evento: 'movimentacao',
          descricao: `Equipamento "${ferramenta.name}" marcado como desaparecido`,
          user_id: user?.id,
          owner_id: user?.id,
          metadata: {
            ferramenta_nome: ferramenta.name,
            ferramenta_id: ferramenta.id,
            status_anterior: ferramenta.status,
            status_novo: 'desaparecida'
          }
        });
      }

      await loadData();
      triggerRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status');
    }
  };


  const getLocationName = (type?: string, id?: string, status?: string) => {
    if (status === 'disponivel') return 'Disponível';
    if (!type || !id) return 'Sem localização';
    if (type === 'obra') {
      const obra = obras.find(o => o.id === id);
      return obra ? obra.title : 'Obra desconhecida';
    }
    return 'Localização desconhecida';
  };

  if (loading && ferramentas.length === 0) {
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
            Gerenciamento de Equipamentos
          </h1>
          <p className="text-gray-400">
            Cadastre e gerencie seus equipamentos
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setLoading(true);
              loadData(0);
            }}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50"
            title="Recarregar equipamentos"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Recarregar</span>
          </button>
          {canCreateFerramentas && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
            >
              <Plus size={20} />
              <span>Novo Equipamento</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ferramentas.map((ferramenta) => (
          <div
            key={ferramenta.id}
            className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 group ${
              ferramenta.status === 'desaparecida'
                ? 'bg-red-500/5 border-red-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            onClick={() => {
              setSelectedFerramenta(ferramenta);
              setShowDetailsModal(true);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                <FerramentaImage
                  ferramentaId={ferramenta.id}
                  alt={ferramenta.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  ferramenta.status === 'desaparecida'
                    ? 'bg-gradient-to-br from-red-600 to-red-500'
                    : 'bg-gradient-to-br from-purple-600 to-purple-500'
                }`}>
                  {ferramenta.status === 'desaparecida' ? (
                    <Package className="w-6 h-6 text-white" />
                  ) : (
                    <Wrench className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {(isHost || canCreateFerramentas) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setEditingId(ferramenta.id);
                      setFormData({
                        name: ferramenta.name || '',
                        tipo: ferramenta.tipo || '',
                        modelo: ferramenta.modelo || '',
                        serial: ferramenta.serial || '',
                        current_type: 'obra',
                        current_id: ferramenta.current_id || '',
                        descricao: ferramenta.descricao || '',
                        nf: ferramenta.nf || '',
                        nf_image: null,
                        tool_image: null,
                        data: ferramenta.data || '',
                        valor: ferramenta.valor ? String(ferramenta.valor) : '',
                        tempo_garantia_dias: ferramenta.tempo_garantia_dias ? String(ferramenta.tempo_garantia_dias) : '',
                        garantia: ferramenta.garantia || '',
                        marca: ferramenta.marca || '',
                        numero_lacre: ferramenta.numero_lacre || '',
                        numero_placa: ferramenta.numero_placa || '',
                        adesivo: ferramenta.adesivo || '',
                        usuario: ferramenta.usuario || '',
                        obra: ferramenta.obra || '',
                      });
                      setShowModal(true);
                    }}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                    title="Editar equipamento"
                  >
                    <Edit size={18} />
                  </button>
                  )}
                  {canTransferFerramentas && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setSelectedFerramenta(ferramenta);
                      setShowMoveModal(true);
                    }}
                    className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                    title="Mover equipamento"
                  >
                    <ArrowRight size={18} />
                  </button>
                  )}
                  {canMarkDesaparecida && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(ferramenta);
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      ferramenta.status === 'desaparecida'
                        ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                    title={ferramenta.status === 'desaparecida' ? 'Marcar como encontrado' : 'Marcar como desaparecido'}
                  >
                    <Package size={18} />
                  </button>
                  )}
                  {canDeleteFerramentas && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(ferramenta.id);
                    }}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                  >
                    <Trash2 size={18} />
                  </button>
                  )}
                </div>
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
                  <p className="text-xs text-gray-400 mb-1">Localização atual</p>
                  <p className="text-sm text-white">
                    {getLocationName(ferramenta.current_type, ferramenta.current_id, ferramenta.status)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    ferramenta.status === 'desaparecida'
                      ? 'bg-red-500/10 text-red-400'
                      : ferramenta.status === 'em_uso'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  {ferramenta.status === 'desaparecida'
                    ? 'Desaparecido'
                    : ferramenta.status === 'em_uso'
                    ? 'Em uso'
                    : 'Disponível'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {ferramentas.length === 0 && !loading && (
        <div className="text-center py-20">
          <Wrench className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Nenhum equipamento cadastrado
          </h3>
          <p className="text-gray-500 mb-6">
            {canCreateFerramentas
              ? 'Comece adicionando seu primeiro equipamento'
              : 'Aguarde o administrador cadastrar equipamentos'}
          </p>
          <button
            onClick={() => {
              console.log('🔄 Usuário clicou em recarregar manualmente');
              setLoading(true);
              loadData(0);
            }}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-300"
          >
            Recarregar Página
          </button>
          <p className="text-gray-600 text-sm mt-4">
            Se os equipamentos não aparecerem, abra o Console (F12) e envie os logs para suporte
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm modal-backdrop-enter">
          <div className="relative w-full max-w-2xl modal-enter">
            {/* Main Modal Container */}
            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-red-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {isEditing ? 'Editar Equipamento' : 'Novo Equipamento'}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {isEditing ? 'Atualize as informações do equipamento' : 'Cadastre um novo equipamento'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setIsEditing(false);
                      setEditingId(null);
                      setFormData({
                        name: '',
                        tipo: '',
                        modelo: '',
                        serial: '',
                        current_type: 'obra',
                        current_id: '',
                        descricao: '',
                        nf: '',
                        nf_image: null,
                        tool_image: null,
                        data: '',
                        valor: '',
                        tempo_garantia_dias: '',
                        garantia: '',
                        marca: '',
                        numero_lacre: '',
                        numero_placa: '',
                        adesivo: '',
                        usuario: '',
                        obra: '',
                      });
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {/* Tipo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Tipo
                  </label>
                  <input
                    type="text"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    placeholder="Tipo do equipamento"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                  />
                </div>

                {/* Item */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Item *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do equipamento"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                    required
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Descrição
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descrição do equipamento"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
                    rows={2}
                  />
                </div>

                {/* NF */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    NF (Nota Fiscal)
                  </label>
                  <input
                    type="text"
                    value={formData.nf}
                    onChange={(e) => setFormData({ ...formData, nf: e.target.value })}
                    placeholder="Número da nota fiscal"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-200"
                  />
                </div>

                {/* Upload de Imagem da Ferramenta */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Imagem do Equipamento
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, tool_image: e.target.files?.[0] || null })}
                      className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                    />
                    {formData.tool_image && (
                      <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center space-x-2">
                        <ImageIcon className="w-4 h-4 text-green-400" />
                        <p className="text-green-400 text-sm">✓ {formData.tool_image.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload de Imagem da NF */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Imagem da NF
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({ ...formData, nf_image: e.target.files?.[0] || null })}
                      className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-500 file:text-white hover:file:bg-red-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                    />
                    {formData.nf_image && (
                      <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-400 text-sm">✓ {formData.nf_image.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Data
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200"
                  />
                </div>

                {/* Valor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.valor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^[\d.,]*$/.test(value)) {
                        setFormData({ ...formData, valor: value });
                      }
                    }}
                    placeholder="0,00"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-200"
                  />
                </div>

                {/* Tempo Garantia (Dias) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Tempo Garantia (Dias)
                  </label>
                  <input
                    type="number"
                    value={formData.tempo_garantia_dias}
                    onChange={(e) => setFormData({ ...formData, tempo_garantia_dias: e.target.value })}
                    placeholder="Ex: 365"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-200"
                  />
                </div>

                {/* Garantia */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Garantia
                  </label>
                  <input
                    type="text"
                    value={formData.garantia}
                    onChange={(e) => setFormData({ ...formData, garantia: e.target.value })}
                    placeholder="Informações sobre garantia"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all duration-200"
                  />
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Modelo
                  </label>
                  <input
                    type="text"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Modelo do equipamento"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200"
                  />
                </div>

                {/* Marca */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Marca do equipamento"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
                  />
                </div>

                {/* Número de Série */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Número de Série
                  </label>
                  <input
                    type="text"
                    value={formData.serial}
                    onChange={(e) => setFormData({ ...formData, serial: e.target.value })}
                    placeholder="Número de série"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                  />
                </div>

                {/* Número de Lacre */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Número de Lacre
                  </label>
                  <input
                    type="text"
                    value={formData.numero_lacre}
                    onChange={(e) => setFormData({ ...formData, numero_lacre: e.target.value })}
                    placeholder="Número do lacre"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                  />
                </div>

                {/* Número da Placa */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Número da Placa
                  </label>
                  <input
                    type="text"
                    value={formData.numero_placa}
                    onChange={(e) => setFormData({ ...formData, numero_placa: e.target.value })}
                    placeholder="Número da placa"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all duration-200"
                  />
                </div>

                {/* Adesivo */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Adesivo
                  </label>
                  <input
                    type="text"
                    value={formData.adesivo}
                    onChange={(e) => setFormData({ ...formData, adesivo: e.target.value })}
                    placeholder="Informações do adesivo"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-200"
                  />
                </div>

                {/* Usuário */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Usuário
                  </label>
                  <input
                    type="text"
                    value={formData.usuario}
                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                    placeholder="Nome do usuário responsável"
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 transition-all duration-200"
                  />
                </div>

                {/* Localização (opcional) */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Obra (opcional)
                  </label>
                  <select
                    value={formData.current_id}
                    onChange={(e) => setFormData({ ...formData, current_id: e.target.value })}
                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                  >
                    <option value="">Sem obra vinculada</option>
                    {obras.map((obra) => (
                      <option key={obra.id} value={obra.id}>
                        {obra.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setIsEditing(false);
                      setEditingId(null);
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
                        <span>{isEditing ? 'Atualizando...' : 'Salvando...'}</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="w-4 h-4" />
                        <span>{isEditing ? 'Atualizar' : 'Salvar'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMoveModal && selectedFerramenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl blur-xl"></div>
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-semibold text-white">
                  Mover Equipamento
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedFerramenta.name}
                </p>
              </div>
              <form onSubmit={handleMove} className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Localização atual</p>
                  <p className="text-sm text-white">
                    {getLocationName(selectedFerramenta.current_type, selectedFerramenta.current_id, selectedFerramenta.status)}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Tipo de Destino
                  </label>
                  <select
                    value={moveData.to_type}
                    onChange={(e) => setMoveData({ ...moveData, to_type: e.target.value as 'obra', to_id: '' })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                  >
                    <option value="obra" className="bg-gray-900">Obra</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Obra de Destino
                  </label>
                  {obras.length === 0 ? (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <p className="text-sm text-yellow-400">
                        Nenhuma obra ativa cadastrada. Cadastre uma obra primeiro.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={moveData.to_id}
                      onChange={(e) => setMoveData({ ...moveData, to_id: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                      required
                    >
                      <option value="" className="bg-gray-900">Selecione...</option>
                      {obras.map((obra) => (
                        <option key={obra.id} value={obra.id} className="bg-gray-900">
                          {obra.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Observação (opcional)
                  </label>
                  <textarea
                    value={moveData.note}
                    onChange={(e) => setMoveData({ ...moveData, note: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMoveModal(false);
                      setSelectedFerramenta(null);
                    }}
                    className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Movendo...' : 'Mover'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showDetailsModal && selectedFerramenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetailsModal(false)}>
          <div className="relative w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Detalhes do Equipamento</h2>
                <button onClick={() => setShowDetailsModal(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="mb-4 rounded-xl overflow-hidden border border-white/10">
                  <FerramentaImage
                    ferramentaId={selectedFerramenta.id}
                    alt={selectedFerramenta.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Item</p>
                    <p className="text-white">{selectedFerramenta.name}</p>
                  </div>
                  {selectedFerramenta.modelo && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Modelo</p>
                      <p className="text-white">{selectedFerramenta.modelo}</p>
                    </div>
                  )}
                  {selectedFerramenta.serial && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Serial</p>
                      <p className="text-white">{selectedFerramenta.serial}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Status</p>
                    <p className="text-white capitalize">{selectedFerramenta.status?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Localização</p>
                    <p className="text-white">{getLocationName(selectedFerramenta.current_type, selectedFerramenta.current_id)}</p>
                  </div>
                  {selectedFerramenta.marca && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Marca</p>
                      <p className="text-white">{selectedFerramenta.marca}</p>
                    </div>
                  )}
                  {selectedFerramenta.usuario && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Usuário</p>
                      <p className="text-white">{selectedFerramenta.usuario}</p>
                    </div>
                  )}
                  {selectedFerramenta.numero_lacre && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Nº Lacre</p>
                      <p className="text-white">{selectedFerramenta.numero_lacre}</p>
                    </div>
                  )}
                  {selectedFerramenta.numero_placa && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Nº Placa</p>
                      <p className="text-white">{selectedFerramenta.numero_placa}</p>
                    </div>
                  )}
                  {selectedFerramenta.adesivo && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Adesivo</p>
                      <p className="text-white">{selectedFerramenta.adesivo}</p>
                    </div>
                  )}
                  {selectedFerramenta.valor && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Valor</p>
                      <p className="text-white">R$ {selectedFerramenta.valor.toFixed(2)}</p>
                    </div>
                  )}
                  {selectedFerramenta.tempo_garantia_dias && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Garantia (dias)</p>
                      <p className="text-white">{selectedFerramenta.tempo_garantia_dias}</p>
                    </div>
                  )}
                  {selectedFerramenta.garantia && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-400 mb-1">Garantia</p>
                      <p className="text-white">{selectedFerramenta.garantia}</p>
                    </div>
                  )}
                </div>
                {selectedFerramenta.descricao && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Descrição</p>
                    <p className="text-white">{selectedFerramenta.descricao}</p>
                  </div>
                )}
                {selectedFerramenta.nf && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">NF</p>
                      <p className="text-white">{selectedFerramenta.nf}</p>
                    </div>
                    {selectedFerramenta.nf_image_url && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">Imagem da NF</p>
                        <img src={selectedFerramenta.nf_image_url} alt="NF" className="rounded-lg border border-white/10 max-h-64 object-contain" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
