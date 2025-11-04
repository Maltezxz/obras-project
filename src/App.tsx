import { AuthProvider } from './contexts/AuthContext';
import { RefreshProvider } from './contexts/RefreshContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { useEffect } from 'react';

// VERSÃO DO APP - Incrementar quando houver mudanças que precisam forçar atualização
const APP_VERSION = '2.0.0';
const VERSION_KEY = 'obrasflow_app_version';

console.log('📦 App.tsx - Módulo carregado - Versão:', APP_VERSION);

function AppContent() {
  console.log('🔄 AppContent - Componente renderizando...');

  const { user, loading } = useAuth();

  // Verificar versão e limpar cache se necessário
  useEffect(() => {
    const savedVersion = localStorage.getItem(VERSION_KEY);

    if (savedVersion !== APP_VERSION) {
      console.log('🔄 Nova versão detectada!', { antiga: savedVersion, nova: APP_VERSION });
      console.log('🧹 Limpando cache e forçando atualização...');

      // Limpar TODOS os dados locais
      localStorage.clear();
      sessionStorage.clear();

      // Salvar nova versão
      localStorage.setItem(VERSION_KEY, APP_VERSION);

      // Forçar reload completo (limpa cache do navegador)
      window.location.reload();
    }
  }, []);

  console.log('👤 Estado do Auth:', { user: user?.email || 'null', loading });

  if (loading) {
    console.log('⏳ Mostrando loading...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500"></div>
      </div>
    );
  }

  console.log('🎯 Decisão:', user ? 'Mostrar Dashboard' : 'Mostrar Login');

  const component = user ? <Dashboard /> : <Login />;
  console.log('✅ Componente selecionado:', user ? 'Dashboard' : 'Login');

  return component;
}

function App() {
  console.log('🚀 App - Componente principal renderizando...');

  try {
    return (
      <AuthProvider>
        <RefreshProvider>
          <AppContent />
        </RefreshProvider>
      </AuthProvider>
    );
  } catch (error) {
    console.error('❌ Erro no App:', error);
    return (
      <div style={{ padding: '40px', fontFamily: 'system-ui', textAlign: 'center' }}>
        <h1 style={{ color: '#e74c3c' }}>❌ Erro Fatal</h1>
        <p style={{ color: '#666' }}>{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <p style={{ fontSize: '14px', color: '#999' }}>Veja o console para detalhes</p>
      </div>
    );
  }
}

export default App;
