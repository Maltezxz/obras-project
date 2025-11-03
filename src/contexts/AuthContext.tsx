import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthContextType } from '../types';
import { PROTECTED_HOST } from '../constants/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

function simpleHash(password: string): string {
  return btoa(password);
}

// COOKIES seguros para sincronização entre dispositivos
const AUTH_COOKIE_NAME = 'obrasflow_auth';
const COOKIE_EXPIRES_DAYS = 30;

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
  console.log('🍪 Cookie salvo:', name);
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const value = c.substring(nameEQ.length, c.length);
      console.log('🍪 Cookie encontrado:', name);
      return value;
    }
  }
  console.log('🍪 Cookie não encontrado:', name);
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  console.log('🍪 Cookie deletado:', name);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔐 AuthProvider - Inicializando...');

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider - Verificando sessão salva...');
    checkSavedSession();

    // Revalidar sessão a cada 5 minutos para garantir sincronização
    const intervalId = setInterval(() => {
      const savedUserId = getCookie(AUTH_COOKIE_NAME);
      if (savedUserId && user) {
        console.log('🔄 Revalidando sessão automaticamente...');
        loadUser(savedUserId);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(intervalId);
  }, [user]);

  // Sincronização em tempo real: escutar mudanças no usuário logado
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Ativando sincronização em tempo real para user:', user.id);

    const channel = supabase
      .channel(`user-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔔 Mudança detectada no usuário:', payload);
          if (payload.eventType === 'UPDATE' && payload.new) {
            console.log('✅ Atualizando dados do usuário em tempo real');
            setUser(payload.new as User);
          } else if (payload.eventType === 'DELETE') {
            console.log('⚠️ Usuário foi deletado, fazendo logout');
            signOut();
          }
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Desativando sincronização em tempo real');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const checkSavedSession = async () => {
    try {
      const savedUserId = getCookie(AUTH_COOKIE_NAME);

      if (savedUserId) {
        console.log('🔐 Sessão encontrada, carregando usuário:', savedUserId);
        await loadUser(savedUserId);
      } else {
        console.log('🔐 Nenhuma sessão salva encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    console.log('⚠️ checkSession chamado mas ignorado (simplificado)');
  };

  const loadUser = async (userId: string) => {
    try {
      console.log('🔄 Carregando usuário do Supabase, ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao carregar usuário:', error);
        throw error;
      }

      if (!data) {
        console.warn('⚠️ Usuário não encontrado no banco de dados:', userId);
        setUser(null);
        deleteCookie(AUTH_COOKIE_NAME);
      } else {
        console.log('✅ Usuário carregado com sucesso do Supabase:', data.name, data.role);
        setUser(data);
        setCookie(AUTH_COOKIE_NAME, data.id, COOKIE_EXPIRES_DAYS);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      setUser(null);
      deleteCookie(AUTH_COOKIE_NAME);
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

      console.log('✅ Login bem-sucedido! Salvando sessão...');

      // LIMPAR TODOS os storages antigos para evitar dados desatualizados
      console.log('🧹 Limpando localStorage e sessionStorage...');
      localStorage.clear();
      sessionStorage.clear();

      // 4. Definir usuário logado e salvar em cookie
      setUser(userData);
      setCookie(AUTH_COOKIE_NAME, userData.id, COOKIE_EXPIRES_DAYS);
      setLoading(false);

    } catch (error: unknown) {
      console.error('❌ Erro no signIn:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    console.log('🚪 Fazendo logout...');
    setUser(null);
    setSession(null);
    deleteCookie(AUTH_COOKIE_NAME);
    console.log('✅ Logout realizado, cookie removido');
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

    // Verificar se está tentando remover o Fernando Antunes (Host protegido)
    if (employeeId === PROTECTED_HOST.id) {
      throw new Error(`${PROTECTED_HOST.name} não pode ser removido. Este é o host principal do sistema.`);
    }

    try {
      // As credenciais serão removidas automaticamente por CASCADE
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', employeeId);

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
      // Buscar IDs de todos os Hosts com mesmo CNPJ
      const hostIds = await getCompanyHostIds();

      // Buscar funcionários criados por QUALQUER host do mesmo CNPJ
      const { data: funcionarios, error: funcError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'funcionario')
        .in('host_id', hostIds)
        .order('name');

      if (funcError) {
        console.error('Erro ao buscar funcionários:', funcError);
      }

      // Buscar outros hosts do mesmo CNPJ (excluir o próprio usuário)
      const { data: hosts, error: hostError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'host')
        .eq('cnpj', user.cnpj)
        .neq('id', user.id)
        .order('name');

      if (hostError) {
        console.error('Erro ao buscar hosts:', hostError);
      }

      // Combinar funcionários e hosts
      return [...(funcionarios || []), ...(hosts || [])];
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
      const { data: hosts, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'host')
        .eq('cnpj', user.cnpj);

      if (error) {
        console.error('Erro ao buscar IDs dos hosts:', error);
        return [user.id];
      }

      return hosts?.map(h => h.id) || [user.id];
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
