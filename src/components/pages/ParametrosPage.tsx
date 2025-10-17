import { useState, useEffect, useCallback } from 'react';
import { Settings, User, Mail, Building2, Shield, Users, ChevronRight, X, Save } from 'lucide-react';
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

interface Permission {
  id: string;
  user_id: string;
  obra_id: string;
  host_id: string;
}

export default function ParametrosPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [selectedObras, setSelectedObras] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id || user.role !== 'host') {
      setLoading(false);
      return;
    }

    try {
      const [usersResult, obrasResult, permissionsResult] = await Promise.all([
        supabase
          .from('users')
          .select('id, name, email, role, created_at')
          .eq('host_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('obras')
          .select('*')
          .eq('owner_id', user.id)
          .order('title', { ascending: true }),
        supabase
          .from('user_obra_permissions')
          .select('*')
          .eq('host_id', user.id)
      ]);

      if (usersResult.data) setUsers(usersResult.data);
      if (obrasResult.data) setObras(obrasResult.data);
      if (permissionsResult.data) setPermissions(permissionsResult.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUserSelect = (selectedUser: UserWithPermissions) => {
    setSelectedUser(selectedUser);

    const userPermissions = permissions
      .filter(p => p.user_id === selectedUser.id)
      .map(p => p.obra_id);

    if (userPermissions.length === 0) {
      setSelectedObras(new Set(obras.map(o => o.id)));
    } else {
      setSelectedObras(new Set(userPermissions));
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

  const handleSavePermissions = async () => {
    if (!selectedUser || !user?.id) return;

    setSaving(true);
    try {
      await supabase
        .from('user_obra_permissions')
        .delete()
        .eq('user_id', selectedUser.id)
        .eq('host_id', user.id);

      const newPermissions = Array.from(selectedObras).map(obraId => ({
        user_id: selectedUser.id,
        obra_id: obraId,
        host_id: user.id
      }));

      if (newPermissions.length > 0) {
        const { error } = await supabase
          .from('user_obra_permissions')
          .insert(newPermissions);

        if (error) throw error;
      }

      alert('Permissões atualizadas com sucesso!');
      await loadData();
      setSelectedUser(null);
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      alert('Erro ao salvar permissões');
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
                    const userPermissions = permissions.filter(p => p.user_id === u.id);
                    const permissionCount = userPermissions.length || obras.length;

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
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            Acesso a {permissionCount} de {obras.length} obras
                          </span>
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

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Selecione as obras que {selectedUser.name} pode acessar:
                </h3>

                {obras.length === 0 ? (
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
                )}
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
