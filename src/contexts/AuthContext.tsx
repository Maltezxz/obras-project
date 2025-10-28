import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthContextType } from '../types';

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

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar usuário:', error);
        throw error;
      }

      if (!data) {
        console.warn('Usuário não encontrado no banco de dados:', userId);
        setUser(null);
        sessionStorage.removeItem('obrasflow_user_id');
      } else {
        console.log('Usuário carregado com sucesso:', data);
        setUser(data);
        sessionStorage.setItem('obrasflow_user_id', data.id);
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

      // 1. Buscar usuário pelo CNPJ e nome
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('cnpj', cnpj.trim())
        .ilike('name', username.trim())
        .maybeSingle();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw new Error('Erro ao buscar usuário no banco de dados');
      }

      if (!userData) {
        throw new Error('Usuário não encontrado. Verifique o CNPJ e nome de usuário.');
      }

      console.log('✅ Usuário encontrado:', userData);

      // 2. Verificar credenciais
      const { data: credData, error: credError } = await supabase
        .from('user_credentials')
        .select('password_hash')
        .eq('user_id', userData.id)
        .maybeSingle();

      if (credError) {
        console.error('Erro ao buscar credenciais:', credError);
        throw new Error('Erro ao verificar credenciais');
      }

      if (!credData) {
        throw new Error('Credenciais não encontradas para este usuário');
      }

      // 3. Validar senha
      const passwordHash = simpleHash(password);
      if (passwordHash !== credData.password_hash) {
        throw new Error('Senha incorreta');
      }

      console.log('✅ Login bem-sucedido!');

      // 4. Definir usuário logado
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
      // 1. Criar funcionário ou host na tabela users
      const { data: tableUser, error: tableError } = await supabase
        .from('users')
        .insert({
          name: employeeData.name,
          email: employeeData.email,
          role: employeeData.role, // pode ser 'funcionario' ou 'host'
          host_id: employeeData.role === 'host' ? null : user.id, // host não tem host_id
          cnpj: hostCnpj,
        })
        .select()
        .single();

      if (tableError) {
        console.error('[addEmployee] Erro ao criar na tabela:', tableError);
        throw new Error(`Erro ao criar funcionário: ${tableError.message}`);
      }

      console.log('[addEmployee] Funcionário criado na tabela:', tableUser.id);

      // 2. Criar credenciais
      const { error: credError } = await supabase
        .from('user_credentials')
        .insert({
          user_id: tableUser.id,
          password_hash: simpleHash(password)
        });

      if (credError) {
        console.error('[addEmployee] Erro ao criar credenciais:', credError);
        // Reverter criação do usuário
        await supabase.from('users').delete().eq('id', tableUser.id);
        throw new Error(`Erro ao criar credenciais: ${credError.message}`);
      }

      console.log('[addEmployee] Funcionário criado com sucesso:', tableUser.id);
      return tableUser;
    } catch (error) {
      console.error('[addEmployee] Erro geral:', error);
      throw error;
    }
  };

  const removeEmployee = async (employeeId: string) => {
    if (user?.role !== 'host') {
      throw new Error('Apenas hosts podem remover funcionários');
    }

    try {
      // As credenciais serão removidas automaticamente por CASCADE
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', employeeId)
        .eq('host_id', user.id);

      if (error) {
        console.error('Erro ao remover funcionário:', error);
        throw new Error(`Erro ao remover funcionário: ${error.message}`);
      }

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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'funcionario')
        .eq('host_id', user.id)
        .order('name');

      if (error) {
        console.error('Erro ao buscar funcionários:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      return [];
    }
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
      getEmployees
    }}>
      {children}
    </AuthContext.Provider>
  );
}
