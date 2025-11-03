import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import logoImage from '../assets/pratica-logo.png';

export default function Login() {
  console.log('🔓 Login - Componente renderizando!');

  const [cnpj, setCnpj] = useState(import.meta.env.VITE_DEFAULT_CNPJ || '');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  console.log('🔓 Login - Estado:', { cnpj, hasUsername: !!username, hasPassword: !!password });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(cnpj, username, password);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  console.log('🎨 Login - Renderizando JSX (tela de login)');

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-800/50 via-transparent to-transparent"></div>

      <div className="absolute inset-0 backdrop-blur-3xl"></div>

      <div className="relative min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-blue-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                <div className="relative transform group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={logoImage}
                    alt="Prática Engenharia"
                    className="w-36 h-36 sm:w-48 sm:h-48 object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-400 text-xs sm:text-sm font-light">
                Gestão inteligente de obras e equipamentos
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl blur-xl"></div>

            <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

              <form onSubmit={handleSubmit} className="relative p-5 sm:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-200">
                      CNPJ
                    </label>
                    <input
                      id="cnpj"
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 backdrop-blur-xl"
                      placeholder="00.000.000/0000-00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                      Usuário
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 backdrop-blur-xl"
                      placeholder="Digite seu usuário"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                      Senha
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all duration-200 backdrop-blur-xl"
                      placeholder="Digite sua senha"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-xl">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 text-white font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">
                    {loading ? 'Entrando...' : 'Entrar'}
                  </span>
                </button>
              </form>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Prática Engenharia © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
