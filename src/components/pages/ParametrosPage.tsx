import { useState, useEffect, useCallback } from 'react';
import { Settings, User, Mail, Building2, Shield, Users, ChevronRight, X, Save, Wrench } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { Obra } from '../../types';

interface UserWithPermissions {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface ObraPermission {
  id: string;
  user_id: string;
  obra_id: string;
  host_id: string;
}

interface FerramentaPermission {
  id: string;
  user_id: string;
  ferramenta_id: string;
  host_id: string;
}

interface Ferramenta {
  id: string;
  name: string;
  tipo: string;
  modelo?: string;
  serial?: string;
  status: string;
}

export default function ParametrosPage() {
  const { user, getCompanyHostIds } = useAuth();
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [ferramentas, setFerramentas] = useState<Ferramenta[]>([]);
  const [obraPermissions, setObraPermissions] = useState<ObraPermission[]>([]);
  const [ferramentaPermissions, setFerramentaPermissions] = useState<FerramentaPermission[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [selectedObras, setSelectedObras] = useState<Set<string>>(new Set());
  const [selectedFerramentas, setSelectedFerramentas] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'obras' | 'ferramentas'>('obras');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id || user.role !== 'host') {
      setLoading(false);
      return;
    }

    try {
      // Buscar IDs de todos os Hosts com mesmo CNPJ
      const hostIds = await getCompanyHostIds?.() || [user.id];

      const [usersResult, obrasResult, ferramentasResult, obraPermissionsResult, ferramentaPermissionsResult] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, email, role, created_at')
          .in('host_id', hostIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('obras')
          .select('*')
          .in('owner_id', hostIds)
          .order('title', { ascending: true }),
        supabase
          .from('ferramentas')
          .select('id, name, tipo, modelo, serial, status')
          .in('owner_id', hostIds)
          .order('name', { ascending: true }),
        supabase
          .from('user_obra_permissions')
          .select('*')
          .in('host_id', hostIds),
        supabase
          .from('user_ferramenta_permissions')
          .select('*')
          .in('host_id', hostIds)
      ]);

      if (usersResult.data) setUsers(usersResult.data);
      if (obrasResult.data) setObras(obrasResult.data);
      if (ferramentasResult.data) setFerramentas(ferramentasResult.data);
      if (obraPermissionsResult.data) setObraPermissions(obraPermissionsResult.data);
      if (ferramentaPermissionsResult.data) setFerramentaPermissions(ferramentaPermissionsResult.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getCompanyHostIds]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserSelect = (selectedUser: UserWithPermissions) => {
    setSelectedUser(selectedUser);
    setActiveTab('obras');

    const userObraPermissions = obraPermissions
      .filter(p => p.user_id === selectedUser.id)
      .map(p => p.obra_id);

    if (userObraPermissions.length === 0) {
      setSelectedObras(new Set(obras.map(o => o.id)));
    } else {
      setSelectedObras(new Set(userObraPermissions));
    }

    const userFerramentaPermissions = ferramentaPermissions
      .filter(p => p.user_id === selectedUser.id)
      .map(p => p.ferramenta_id);

    if (userFerramentaPermissions.length === 0) {
      setSelectedFerramentas(new Set(ferramentas.map(f => f.id)));
    } else {
      setSelectedFerramentas(new Set(userFerramentaPermissions));
    }
  };

  const toggleObraPermission = (obraId: string) => {
    setSelectedObras(prev => {
      const newSet = new Set(prev);
      if (newSet.has(obraId)) {
        newSet.delete(obraId);
      } else {
        newSet.add(obraId);
      }
      return newSet;
    });
  };

  const toggleFerramentaPermission = (ferramentaId: string) => {
    setSelectedFerramentas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ferramentaId)) {
        newSet.delete(ferramentaId);
      } else {
        newSet.add(ferramentaId);
      }
      return newSet;
    });
  };

  const selectAllObras = () => {
    setSelectedObras(new Set(obras.map(o => o.id)));
  };

  const deselectAllObras = () => {
    setSelectedObras(new Set());
  };

  const selectAllFerramentas = () => {
    setSelectedFerramentas(new Set(ferramentas.map(f => f.id)));
  };

  const deselectAllFerramentas = () => {
    setSelectedFerramentas(new Set());
  };

  const handleSavePermissions = async () => {
    if (!selectedUser || !user?.id) return;

    setSaving(true);
    try {
      console.log('=== INICIANDO SALVAMENTO DE PERMISSÕES ===');
      console.log('Usuário selecionado:', selectedUser.id);
      console.log('Host logado:', user.id);
      console.log('Obras selecionadas:', Array.from(selectedObras));
      console.log('Ferramentas selecionadas:', Array.from(selectedFerramentas));

      const obraIds = Array.from(selectedObras);
      const ferramentaIds = Array.from(selectedFerramentas);

      const [obraResult, ferramentaResult] = await Promise.all([
        supabase.rpc('manage_user_obra_permissions', {
          p_host_id: user.id,
          p_user_id: selectedUser.id,
          p_obra_ids: obraIds.length > 0 ? obraIds : []
        }),
        supabase.rpc('manage_user_ferramenta_permissions', {
          p_host_id: user.id,
          p_user_id: selectedUser.id,
          p_ferramenta_ids: ferramentaIds.length > 0 ? ferramentaIds : []
        })
      ]);

      if (obraResult.error) {
        console.error('Erro ao salvar permissões de obras:', obraResult.error);
        throw new Error(`Erro ao salvar permissões de obras: ${obraResult.error.message}`);
      }

      if (ferramentaResult.error) {
        console.error('Erro ao salvar permissões de ferramentas:', ferramentaResult.error);
        throw new Error(`Erro ao salvar permissões de ferramentas: ${ferramentaResult.error.message}`);
      }

      if (obraResult.data && !obraResult.data.success) {
        throw new Error(obraResult.data.error || 'Erro ao salvar permissões de obras');
      }

      if (ferramentaResult.data && !ferramentaResult.data.success) {
        throw new Error(ferramentaResult.data.error || 'Erro ao salvar permissões de ferramentas');
      }

      console.log('✓ Permissões salvas com sucesso');
      alert(`Permissões atualizadas com sucesso!\n${obraResult.data.permissions_count} obra(s) e ${ferramentaResult.data.permissions_count} ferramenta(s) permitidas.`);
      await loadData();
      setSelectedUser(null);
    } catch (error: unknown) {
      console.error('ERRO ao salvar permissões:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar permissões';
      alert(`Erro: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-semibold text-white mb-2">
          Parâmetros do Sistema
        </h1>
        <p className="text-gray-400">
          Configurações e informações da conta
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-red-500">
                <User className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Informações do Usuário
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-white/5">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Nome</p>
                  <p className="text-white">{user?.name}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-white/5">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-white">{user?.email}</p>
                </div>
              </div>
              {user?.cnpj && (
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-white/5">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">CNPJ</p>
                    <p className="text-white">{user.cnpj}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-white/5">
                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Tipo de Conta</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      user?.role === 'host'
                        ? 'bg-red-500/10 text-red-400'
                        : 'bg-blue-500/10 text-blue-400'
                    }`}
                  >
                    {user?.role === 'host' ? 'Host (Engenheiro)' : 'Funcionário'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="relative p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Sobre o Sistema
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-2">ObraFlow</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Sistema completo de gestão de obras, estabelecimentos e equipamentos,
                  desenvolvido para engenheiros e suas equipes.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">Funcionalidades</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Gestão completa de obras e estabelecimentos</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Controle de equipamentos e ferramentas</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Rastreamento de movimentações</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Relatórios e exportação de dados</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Controle de usuários e permissões</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">
                  Versão 1.0.0 • © 2025 Prática Engenharia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {user?.role === 'host' && (
        <>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Conta Host (Engenheiro)
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    Como usuário Host, você tem acesso completo ao sistema, incluindo:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400">✓</span>
                      <span>Cadastro e gerenciamento de obras e estabelecimentos</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400">✓</span>
                      <span>Criação e gerenciamento de contas de usuários</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400">✓</span>
                      <span>Acesso a relatórios completos e exportação de dados</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-400">✓</span>
                      <span>Controle total de equipamentos e movimentações</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Gerenciamento de Usuários e Acesso às Obras
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Controle quais obras cada usuário pode visualizar
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    Nenhum usuário cadastrado ainda
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.map((u) => {
                    const userObraPerms = obraPermissions.filter(p => p.user_id === u.id);
                    const userFerramentaPerms = ferramentaPermissions.filter(p => p.user_id === u.id);
                    const obraCount = userObraPerms.length || obras.length;
                    const ferramentaCount = userFerramentaPerms.length || ferramentas.length;

                    return (
                      <button
                        key={u.id}
                        onClick={() => handleUserSelect(u)}
                        className="relative p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-200 text-left group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <User className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                {u.name}
                              </h3>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">
                              Obras: {obraCount} de {obras.length}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">
                              Ferramentas: {ferramentaCount} de {ferramentas.length}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm modal-backdrop-enter">
          <div className="relative w-full max-w-2xl modal-enter">
            <div className="relative backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="relative p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-blue-600/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedUser.name}
                      </h2>
                      <p className="text-gray-400 text-sm">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 bg-white/5">
                <button
                  onClick={() => setActiveTab('obras')}
                  className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === 'obras'
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>Obras</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                      {selectedObras.size}/{obras.length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('ferramentas')}
                  className={`flex-1 px-6 py-4 font-medium transition-all duration-200 ${
                    activeTab === 'ferramentas'
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Wrench className="w-4 h-4" />
                    <span>Ferramentas</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                      {selectedFerramentas.size}/{ferramentas.length}
                    </span>
                  </div>
                </button>
              </div>

              <div className="p-6">
                {/* Action Buttons */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {activeTab === 'obras' ? 'Permissões de Obras' : 'Permissões de Ferramentas'}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={activeTab === 'obras' ? selectAllObras : selectAllFerramentas}
                      className="px-3 py-1.5 text-xs font-medium text-green-400 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-all duration-200"
                    >
                      Selecionar Todas
                    </button>
                    <button
                      onClick={activeTab === 'obras' ? deselectAllObras : deselectAllFerramentas}
                      className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-all duration-200"
                    >
                      Remover Todas
                    </button>
                  </div>
                </div>

                <div className="max-h-[50vh] overflow-y-auto">
                  {activeTab === 'obras' ? (
                    obras.length === 0 ? (
                      <div className="text-center py-8">
                        <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                          Nenhuma obra cadastrada
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {obras.map((obra) => (
                          <label
                            key={obra.id}
                            className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all duration-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedObras.has(obra.id)}
                              onChange={() => toggleObraPermission(obra.id)}
                              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Building2 className="w-4 h-4 text-blue-400" />
                                <h4 className="text-white font-medium">{obra.title}</h4>
                              </div>
                              <p className="text-sm text-gray-400">{obra.endereco}</p>
                              {obra.engenheiro && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Eng: {obra.engenheiro}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )
                  ) : (
                    ferramentas.length === 0 ? (
                      <div className="text-center py-8">
                        <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                          Nenhuma ferramenta cadastrada
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {ferramentas.map((ferramenta) => (
                          <label
                            key={ferramenta.id}
                            className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all duration-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFerramentas.has(ferramenta.id)}
                              onChange={() => toggleFerramentaPermission(ferramenta.id)}
                              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Wrench className="w-4 h-4 text-purple-400" />
                                <h4 className="text-white font-medium">{ferramenta.name}</h4>
                              </div>
                              {ferramenta.tipo && (
                                <p className="text-sm text-gray-400">Tipo: {ferramenta.tipo}</p>
                              )}
                              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                {ferramenta.modelo && <span>Modelo: {ferramenta.modelo}</span>}
                                {ferramenta.serial && <span>Serial: {ferramenta.serial}</span>}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-white/5">
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Salvar Permissões</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
