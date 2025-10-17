import { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import HomePage from './pages/HomePage';
import ObrasPage from './pages/ObrasPage';
import UsuariosPage from './pages/UsuariosPage';
import FerramentasPage from './pages/FerramentasPage';
import HistoricoPage from './pages/HistoricoPage';
import ParametrosPage from './pages/ParametrosPage';
import DesaparecidosPage from './pages/DesaparecidosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import { usePermissions } from '../hooks/usePermissions';

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { canManageUsers, canManageObras } = usePermissions();

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'obras':
        return canManageObras ? <ObrasPage /> : <HomePage />;
      case 'usuarios':
        return canManageUsers ? <UsuariosPage /> : <HomePage />;
      case 'ferramentas':
        return <FerramentasPage />;
      case 'historico':
        return <HistoricoPage />;
      case 'parametros':
        return canManageUsers ? <ParametrosPage /> : <HomePage />;
      case 'desaparecidos':
        return <DesaparecidosPage />;
      case 'relatorios':
        return <RelatoriosPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-72' : 'lg:ml-20'
        }`}
      >
        <header className="sticky top-0 z-20 bg-black/50 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all duration-200"
            >
              <Menu size={24} />
            </button>
            <div className="flex-1 lg:flex-none"></div>
          </div>
        </header>

        <main className="p-3 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
