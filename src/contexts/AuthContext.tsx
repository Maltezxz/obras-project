import React, { createContext, useEffect, useState } from 'react';
import { User, AuthContextType } from '../types';
import { PROTECTED_HOST } from '../constants/auth';
import { getDatabase, selectOne, selectAll, insertOne, deleteOne, saveDatabase } from '../lib/database';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function simpleHash(password: string): string {
  return btoa(password);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      await getDatabase();
      const storedUserId = sessionStorage.getItem('obrasflow_user_id');
      if (storedUserId) {
        await loadUser(storedUserId);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async (userId: string) => {
    try {
      console.log('Carregando usuário com ID:', userId);

      const userData = await selectOne('users', 'id = ?', [userId]);

      if (!userData) {
        console.warn('Usuário não encontrado no banco de dados:', userId);
        setUser(null);
        sessionStorage.removeItem('obrasflow_user_id');
      } else {
        console.log('Usuário carregado com sucesso:', userData);
        setUser(userData);
        sessionStorage.setItem('obrasflow_user_id', userData.id);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      setUser(null);
      sessionStorage.removeItem('obrasflow_user_id');
    }
  };

  const signIn = async (cnpj: string, username: string, password: string) => {
    try {
      console.log('🔍 Tentando login com:', { cnpj, username });

      await getDatabase();

      const userData = await selectOne(
        'users',
        'cnpj = ? AND LOWER(name) = LOWER(?)',
        [cnpj.trim(), username.trim()]
      );

      if (!userData) {
        throw new Error('Usuário não encontrado. Verifique o CNPJ e nome de usuário.');
      }

      console.log('✅ Usuário encontrado:', userData);

      const credData = await selectOne('user_credentials', 'user_id = ?', [userData.id]);

      if (!credData) {
        throw new Error('Credenciais não encontradas para este usuário');
      }

      const passwordHash = simpleHash(password);
      if (passwordHash !== credData.password_hash) {
        throw new Error('Senha incorreta');
      }

      console.log('✅ Login bem-sucedido!');

      setUser(userData);
      sessionStorage.setItem('obrasflow_user_id', userData.id);
      setLoading(false);

    } catch (error: unknown) {
      console.error('Erro no signIn:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    sessionStorage.removeItem('obrasflow_user_id');
  };

  const addEmployee = async (
    employeeData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'host_id' | 'cnpj'>,
    password: string
  ) => {
    if (user?.role !== 'host') {
      throw new Error('Apenas hosts podem cadastrar funcionários');
    }

    const hostCnpj = user.cnpj;
    console.log('[addEmployee] Iniciando cadastro:', { name: employeeData.name, email: employeeData.email });

    try {
      const newUserId = await insertOne('users', {
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
        host_id: employeeData.role === 'host' ? null : user.id,
        cnpj: hostCnpj,
      });

      console.log('[addEmployee] Usuário criado na tabela:', newUserId);

      await insertOne('user_credentials', {
        user_id: newUserId,
        password_hash: simpleHash(password)
      });

      console.log('[addEmployee] Funcionário criado com sucesso:', newUserId);

      const newUser = await selectOne('users', 'id = ?', [newUserId]);
      return newUser;
    } catch (error) {
      console.error('[addEmployee] Erro geral:', error);
      throw error;
    }
  };

  const removeEmployee = async (employeeId: string) => {
    if (user?.role !== 'host') {
      throw new Error('Apenas hosts podem remover funcionários');
    }

    if (employeeId === PROTECTED_HOST.id) {
      throw new Error(`${PROTECTED_HOST.name} não pode ser removido. Este é o host principal do sistema.`);
    }

    try {
      await deleteOne('users', employeeId);
      console.log('Funcionário removido com sucesso');
    } catch (error) {
      console.error('Erro ao remover funcionário:', error);
      throw error;
    }
  };

  const getEmployees = async () => {
    if (user?.role !== 'host') {
      return [];
    }

    try {
      const hostIds = await getCompanyHostIds();

      const funcionarios = await selectAll(
        'users',
        `role = 'funcionario' AND host_id IN (${hostIds.map(() => '?').join(',')})`,
        hostIds
      );

      const hosts = await selectAll(
        'users',
        `role = 'host' AND cnpj = ? AND id != ?`,
        [user.cnpj, user.id]
      );

      return [...funcionarios, ...hosts].sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      return [];
    }
  };

  const getCompanyHostIds = async (): Promise<string[]> => {
    if (!user || user.role !== 'host') {
      return [];
    }

    try {
      const hosts = await selectAll('users', 'role = ? AND cnpj = ?', ['host', user.cnpj]);
      return hosts.map(h => h.id);
    } catch (error) {
      console.error('Erro ao buscar IDs dos hosts:', error);
      return [user.id];
    }
  };

  const isProtectedUser = (userId: string): boolean => {
    return userId === PROTECTED_HOST.id;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signOut,
      addEmployee,
      removeEmployee,
      getEmployees,
      getCompanyHostIds,
      isProtectedUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}
