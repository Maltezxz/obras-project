import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Users, Trash2, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';

export default function UsuariosPage() {
  const { user, addEmployee, removeEmployee, getEmployees } = useAuth();
  const [funcionarios, setFuncionarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const loadFuncionarios = useCallback(async () => {
    try {
      if (user?.role === 'host' && getEmployees) {
        const employees = await getEmployees();
        setFuncionarios(employees || []);
      } else {
        setFuncionarios([]);
      }
    } catch (error) {
      console.error('Error loading funcionarios:', error);
    } finally {
      setLoading(false);
    }
  }, [user, getEmployees]);

  useEffect(() => {
    loadFuncionarios();
  }, [loadFuncionarios]);

  // Verificar se o usuário é host
  if (user?.role !== 'host') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-500">
            Apenas hosts podem gerenciar funcionários
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('🔍 [UsuariosPage] Iniciando criação de usuário...');
      console.log('🔍 [UsuariosPage] Dados do formulário:', {
        name: formData.name,
        email: formData.email,
        hasPassword: !!formData.password
      });
      console.log('🔍 [UsuariosPage] Usuário logado:', user);

      if (!addEmployee) {
        throw new Error('Função de adicionar funcionário não disponível');
      }

      if (!formData.name.trim()) {
        throw new Error('Nome é obrigatório');
      }

      if (!formData.email.trim()) {
        throw new Error('Email é obrigatório');
      }

      if (!formData.password.trim()) {
        throw new Error('Senha é obrigatória');
      }

      console.log('🔍 [UsuariosPage] Chamando addEmployee...');

      const newEmployee = await addEmployee({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: 'funcionario',
      }, formData.password.trim());

      console.log('✅ [UsuariosPage] Funcionário criado:', newEmployee);

      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      await loadFuncionarios();

      alert(`Funcionário ${newEmployee.name} criado com sucesso!\n\nCredenciais de login:\nCNPJ: ${user?.cnpj || 'o mesmo do host'}\nUsuário: ${newEmployee.name}\nSenha: ${formData.password}`);
    } catch (error: unknown) {
      console.error('❌ [UsuariosPage] Erro ao criar usuário:', error);
      if (error instanceof Error) {
        console.error('❌ [UsuariosPage] Mensagem de erro:', error.message);
        console.error('❌ [UsuariosPage] Stack:', error.stack);
      }
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert('Erro ao criar usuário: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.')) return;

    try {
      if (!removeEmployee) {
        throw new Error('Função de remover funcionário não disponível');
      }

      if (!userId) {
        throw new Error('ID do funcionário não fornecido');
      }

      removeEmployee(userId);
      await loadFuncionarios();
      alert('Funcionário excluído com sucesso!');
    } catch (error: unknown) {
      console.error('Error deleting user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert('Erro ao excluir funcionário: ' + errorMessage);
    }
  };

  if (loading && funcionarios.length === 0) {
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
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-400">
            Cadastre e gerencie Usuários
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-105"
        >
          <Plus size={20} />
          <span>Novo Usuário</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {funcionarios.map((funcionario) => (
          <div
            key={funcionario.id}
            className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <button
                  onClick={() => handleDelete(funcionario.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {funcionario.name}
              </h3>
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <Mail size={16} />
                <span>{funcionario.email}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500">
                  Cadastrado em {new Date(funcionario.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {funcionarios.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            Nenhum Usuário cadastrado
          </h3>
          <p className="text-gray-500 mb-6">
            Comece adicionando seu primeiro Usuário
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl blur-xl"></div>
            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-2xl font-semibold text-white">
                  Novo Usuário
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Senha do funcionário
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200"
                    required
                    minLength={4}
                  />
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-sm text-blue-300">
                      O funcionário fará login na mesma tela do host usando o mesmo CNPJ e o nome e senha definidos aqui.
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
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
