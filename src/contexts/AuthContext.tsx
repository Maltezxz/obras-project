import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthContextType } from '../types';
import { HOST_FAKE } from '../constants/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  // Persistência local por CNPJ do host (funcionários e senhas)

  const EMP_STORAGE = 'obrasflow_employees_by_cnpj';
  const PASS_STORAGE = 'obrasflow_employee_passwords_by_cnpj';

  const loadEmployeesForCnpj = (cnpj: string): User[] => {
    try {
      const raw = localStorage.getItem(EMP_STORAGE);
      if (!raw) return [];
      const map = JSON.parse(raw) as Record<string, User[]>;
      return map[cnpj] || [];
    } catch {
      return [];
    }
  };

  const saveEmployeesForCnpj = (cnpj: string, list: User[]) => {
    try {
      const raw = localStorage.getItem(EMP_STORAGE);
      const map = raw ? (JSON.parse(raw) as Record<string, User[]>) : {};
      map[cnpj] = list;
      localStorage.setItem(EMP_STORAGE, JSON.stringify(map));
    } catch {
      // noop
    }
  };

  const loadPasswordsForCnpj = (cnpj: string): Record<string, string> => {
    try {
      const raw = localStorage.getItem(PASS_STORAGE);
      if (!raw) return {};
      const map = JSON.parse(raw) as Record<string, Record<string, string>>;
      return map[cnpj] || {};
    } catch {
      return {};
    }
  };

  const savePasswordsForCnpj = (cnpj: string, passMap: Record<string, string>) => {
    try {
      const raw = localStorage.getItem(PASS_STORAGE);
      const map = raw ? (JSON.parse(raw) as Record<string, Record<string, string>>) : {};
      map[cnpj] = passMap;
      localStorage.setItem(PASS_STORAGE, JSON.stringify(map));
    } catch {
      // noop
    }
  };

  useEffect(() => {
    // Se quiser forçar modo visual sem Supabase, comente o bloco abaixo.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setSession(session);
        if (session) {
          loadUser(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUser = async (userId: string) => {
    try {
      console.log('Loading user with ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user:', error);
        throw error;
      }

      if (!data) {
        console.warn('User not found in database with ID:', userId);
        // Tentar buscar por email como fallback
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user?.email) {
          const { data: userByEmail, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.session.user.email)
            .maybeSingle();
          
          if (emailError) {
            console.error('Error loading user by email:', emailError);
          } else if (userByEmail) {
            console.log('User found by email:', userByEmail);
            setUser(userByEmail);
            return;
          }
        }
        setUser(null);
      } else {
        console.log('User loaded successfully:', data);
        setUser(data);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (cnpj: string, username: string, password: string) => {
    try {
      console.log('🔍 Tentando login com:', { cnpj, username, password });
      console.log('🔍 Credenciais esperadas:', HOST_FAKE);

      // 1) Bypass visual: permitir login local sem Supabase
      const cnpjMatch = cnpj.trim() === HOST_FAKE.cnpj;
      const usernameMatch = username.trim().toLowerCase() === HOST_FAKE.username.toLowerCase();
      const passwordMatch = password === HOST_FAKE.password;

      console.log('🔍 Verificação:', { cnpjMatch, usernameMatch, passwordMatch });

      const isBypass = cnpjMatch && usernameMatch && passwordMatch;

      if (isBypass) {
        console.log('✅ Login bypass bem-sucedido!');
        const fakeUser: User = {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Fernando Antunes',
          email: 'fernando.antunes@obrasflow.com',
          cnpj: HOST_FAKE.cnpj,
          role: 'host',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setUser(fakeUser);
        setSession(null);
        setLoading(false);
        return;
      }

      // 2) Verificar se é login de funcionário (via storage por CNPJ)
      const storedEmployees = loadEmployeesForCnpj(cnpj);
      const storedPasswords = loadPasswordsForCnpj(cnpj);
      const employee = storedEmployees.find(emp => emp.name.toLowerCase() === username.trim().toLowerCase());

      if (employee) {
        const savedPass = storedPasswords[employee.id];
        if (savedPass && savedPass === password) {
          setUser(employee);
          setSession(null);
          setLoading(false);
          return;
        }
      }

      console.log('Iniciando processo de login...');
      
      // Primeiro, buscar o usuário na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('cnpj', cnpj)
        .eq('name', username)
        .maybeSingle();

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        throw new Error('Erro ao buscar usuário no banco de dados');
      }

      if (!userData) {
        throw new Error('Usuário não encontrado. Verifique o CNPJ e nome de usuário.');
      }

      console.log('Usuário encontrado na tabela:', userData);
      const email = userData.email;

      // Tentar fazer login com email e senha
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        
        // Se o erro for "Invalid login credentials", significa que o usuário não existe no Supabase Auth
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Senha incorreta ou usuário não cadastrado no sistema de autenticação');
        }
        
        throw new Error(`Erro de autenticação: ${authError.message}`);
      }

      // Se chegou até aqui, o login foi bem-sucedido
      console.log('Login realizado com sucesso:', authData.user);
      
      // Usar o ID do usuário autenticado, não o da tabela
      await loadUser(authData.user.id);
      
    } catch (error: unknown) {
      console.error('Erro no signIn:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      throw new Error(errorMessage);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Em modo visual (bypass), apenas prosseguir
    }
    setUser(null);
    setSession(null);
  };

  // Função para sincronizar IDs entre tabela users e Supabase Auth
  const syncUserIds = async (authUserId: string, tableUserId: string) => {
    try {
      console.log('Sincronizando IDs:', { authUserId, tableUserId });
      
      const { data, error } = await supabase
        .from('users')
        .update({ id: authUserId })
        .eq('id', tableUserId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao sincronizar IDs:', error);
        return false;
      }

      console.log('IDs sincronizados com sucesso:', data);
      return true;
    } catch (error) {
      console.error('Erro geral na sincronização:', error);
      return false;
    }
  };

  // Função para adicionar funcionário (apenas para host)
  const addEmployee = async (employeeData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'host_id' | 'cnpj'>, password: string) => {
    if (user?.role !== 'host') {
      throw new Error('Apenas hosts podem cadastrar funcionários');
    }

    const hostCnpj = user.cnpj || HOST_FAKE.cnpj;
    const isFakeMode = user.id === 'host-fake-id';

    console.log('[addEmployee] Iniciando cadastro:', { name: employeeData.name, email: employeeData.email, isFakeMode });

    // Se estiver em modo fake, usar apenas localStorage
    if (isFakeMode) {
      console.log('[addEmployee] Modo fake - salvando apenas localmente');
      const newEmployee: User = {
        id: `fake-emp-${Date.now()}`,
        name: employeeData.name,
        email: employeeData.email,
        role: 'funcionario',
        host_id: user.id,
        cnpj: hostCnpj,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const list = loadEmployeesForCnpj(hostCnpj);
      list.push(newEmployee);
      saveEmployeesForCnpj(hostCnpj, list);

      const passMap = loadPasswordsForCnpj(hostCnpj);
      passMap[newEmployee.id] = password;
      savePasswordsForCnpj(hostCnpj, passMap);

      console.log('[addEmployee] Funcionário fake criado:', newEmployee.id);
      return newEmployee;
    }

    // Modo normal: criar no Supabase
    console.log('[addEmployee] Modo Supabase - criando no banco');
    const { data: tableUser, error: tableError } = await supabase
      .from('users')
      .insert({
        name: employeeData.name,
        email: employeeData.email,
        role: 'funcionario',
        host_id: user.id,
        cnpj: hostCnpj,
      })
      .select()
      .single();

    if (tableError) {
      console.error('[addEmployee] Erro ao criar na tabela:', tableError);
      throw new Error(`Erro ao criar funcionário: ${tableError.message}`);
    }

    console.log('[addEmployee] Funcionário criado na tabela:', tableUser.id);

    // Criar usuário no Auth
    const { error: authErr } = await supabase.auth.signUp({
      email: tableUser.email,
      password,
      options: { data: { name: tableUser.name, role: 'funcionario', host_id: tableUser.host_id } }
    });

    if (authErr) {
      console.warn('[addEmployee] Aviso ao criar auth:', authErr.message);
    }

    // Persistência local para login
    const newEmployee: User = tableUser;
    const list = loadEmployeesForCnpj(hostCnpj);
    list.push(newEmployee);
    saveEmployeesForCnpj(hostCnpj, list);

    const passMap = loadPasswordsForCnpj(hostCnpj);
    passMap[newEmployee.id] = password;
    savePasswordsForCnpj(hostCnpj, passMap);

    console.log('[addEmployee] Funcionário criado com sucesso:', newEmployee.id);
    return newEmployee;
  };

  // Função para remover funcionário (apenas para host)
  const removeEmployee = async (employeeId: string) => {
    if (user?.role !== 'host') {
      throw new Error('Apenas hosts podem remover funcionários');
    }
    const hostCnpj = user.cnpj || HOST_FAKE.cnpj;
    const list = loadEmployeesForCnpj(hostCnpj);
    const filtered = list.filter((emp: User) => emp.id !== employeeId);
    saveEmployeesForCnpj(hostCnpj, filtered);

    // Remover também da tabela (soft delete não implementado; aqui delete direto)
    await supabase.from('users').delete().eq('id', employeeId);
  };

  // Função para listar funcionários (apenas para host)
  const getEmployees = async () => {
    if (user?.role !== 'host') {
      return [];
    }
    const hostCnpj = user.cnpj || HOST_FAKE.cnpj;
    // Tentar carregar do Supabase
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'funcionario')
      .eq('host_id', user.id);

    if (!error && data) {
      // Sincroniza cache local
      saveEmployeesForCnpj(hostCnpj, data);
      return data;
    }

    const list = loadEmployeesForCnpj(hostCnpj);
    return list.filter(emp => emp.host_id === user.id);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signOut, 
      syncUserIds,
      addEmployee,
      removeEmployee,
      getEmployees
    }}>
      {children}
    </AuthContext.Provider>
  );
}

