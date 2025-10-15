import { useAuth } from './useAuth';

export function usePermissions() {
  const { user } = useAuth();

  const isHost = user?.role === 'host';
  const isEmployee = user?.role === 'funcionario';
  const isAuthenticated = !!user;

  // Regras
  const canManageUsers = !!isHost;
  const canManageObras = !!isHost;
  const canCreateFerramentas = !!isHost;
  const canDeleteFerramentas = !!isHost;
  const canViewRelatorios = !!isHost;
  const canTransferFerramentas = isHost || isEmployee; // ambos
  const canMarkDesaparecida = isHost || isEmployee; // ambos
  const canManageFerramentas = isAuthenticated; // listar/visualizar

  return {
    isHost,
    isEmployee,
    isAuthenticated,
    canManageUsers,
    canManageObras,
    canManageFerramentas,
    canCreateFerramentas,
    canDeleteFerramentas,
    canViewRelatorios,
    canTransferFerramentas,
    canMarkDesaparecida,
  };
}
