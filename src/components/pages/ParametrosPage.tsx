import { Settings, User, Mail, Building2, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function ParametrosPage() {
  const { user } = useAuth();

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
      )}
    </div>
  );
}
