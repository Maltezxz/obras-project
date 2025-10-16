import {
  Home,
  Building2,
  Users,
  Wrench,
  Settings,
  AlertTriangle,
  FileText,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import logoImage from '../assets/pratica-logo-horizontal.png';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ currentPage, setCurrentPage, isOpen, setIsOpen }: SidebarProps) {
  const { user, signOut } = useAuth();
  const { 
    isHost, 
    canManageUsers, 
    canManageObras, 
    canManageFerramentas, 
    canViewRelatorios 
  } = usePermissions();

  const handleMenuClick = (itemId: string) => {
    setCurrentPage(itemId);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const handleSignOut = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      signOut();
    }
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, show: true },
    { id: 'obras', label: 'Cadastro de Obra', icon: Building2, show: canManageObras },
    { id: 'usuarios', label: 'Cadastro de Usuário', icon: Users, show: canManageUsers },
    { id: 'ferramentas', label: 'Equipamentos', icon: Wrench, show: canManageFerramentas },
    { id: 'historico', label: 'Histórico', icon: History, show: canViewRelatorios },
    { id: 'parametros', label: 'Parâmetros', icon: Settings, show: isHost },
    { id: 'desaparecidos', label: 'Equipamentos Desaparecidos', icon: AlertTriangle, show: canManageFerramentas },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, show: canViewRelatorios },
  ];

  const filteredMenuItems = menuItems.filter(item => item.show);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-gray-900 via-black to-gray-900 border-r border-white/10 z-40 transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isOpen ? 'w-72' : 'lg:w-20'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className={`relative group ${!isOpen && 'lg:mx-auto'}`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-blue-500/20 rounded-lg blur-md opacity-50 group-hover:opacity-70 transition-all duration-300"></div>
                  <div className="relative">
                    <img
                      src={logoImage}
                      alt="Prática Engenharia"
                      className={`object-contain drop-shadow-lg transition-all duration-300 ${
                        isOpen ? 'w-44 h-auto' : 'w-12 h-auto'
                      }`}
                    />
                  </div>
                </div>
                {isOpen && (
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 flex-shrink-0"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
              </div>
              {!isOpen && (
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 mx-auto"
                >
                  <ChevronRight size={20} />
                </button>
              )}
              {isOpen && (
                <div className="px-2">
                  <p className="text-xs text-gray-400">
                    {user?.name || 'Usuário'}
                    {user?.role && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                        {user.role === 'host' ? 'Host' : `Usuário ${user.user_id || ''}`}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-red-500/10 text-red-500 shadow-lg shadow-red-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  } ${!isOpen && 'lg:justify-center'}`}
                >
                  <Icon
                    size={20}
                    className={`flex-shrink-0 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  {isOpen && (
                    <span className="text-sm font-medium truncate">
                      {item.label}
                    </span>
                  )}
                  {isActive && isOpen && (
                    <div className="ml-auto w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200 group ${
                !isOpen && 'lg:justify-center'
              }`}
            >
              <LogOut
                size={20}
                className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
              />
              {isOpen && (
                <span className="text-sm font-medium">Sair</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
