// Script para administrar o Supabase usando credenciais diretas
// Execute este script no console do navegador ou como script Node.js

import { createClient } from '@supabase/supabase-js';

// CONFIGURAÇÃO: Substitua pelas suas credenciais do Supabase
const SUPABASE_CONFIG = {
  url: 'https://seu-projeto.supabase.co', // Substitua pela sua URL
  anonKey: 'sua-chave-anonima', // Substitua pela sua chave anônima
  serviceKey: 'sua-service-key' // Substitua pela sua service key (para operações admin)
};

// Cliente normal (anon key)
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Cliente administrativo (service key)
const supabaseAdmin = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey);

// Função para verificar a conexão
async function testConnection() {
  console.log('🔌 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase OK!');
    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Função para verificar usuários na tabela
async function checkUsersTable() {
  console.log('👥 Verificando usuários na tabela...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('cnpj', '89.263.465/0001-49')
      .eq('name', 'danilo');
    
    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return null;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Usuário encontrado na tabela:', data[0]);
      return data[0];
    } else {
      console.log('⚠️ Usuário não encontrado na tabela');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return null;
  }
}

// Função para criar usuário na tabela
async function createUserInTable() {
  console.log('👤 Criando usuário na tabela...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name: 'danilo',
        email: 'danilo@teste.com',
        cnpj: '89.263.465/0001-49',
        role: 'host'
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return null;
    }
    
    console.log('✅ Usuário criado na tabela:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return null;
  }
}

// Função para verificar usuários no Auth
async function checkAuthUsers() {
  console.log('🔐 Verificando usuários no Supabase Auth...');
  
  try {
    // Tentar fazer login para verificar se o usuário existe
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'danilo@teste.com',
      password: '123'
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('⚠️ Usuário não existe no Supabase Auth');
        return false;
      } else {
        console.error('❌ Erro no login:', error);
        return false;
      }
    } else {
      console.log('✅ Usuário existe no Supabase Auth:', data.user);
      return true;
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Função para criar usuário no Auth (requer service key)
async function createUserInAuth() {
  console.log('🔐 Criando usuário no Supabase Auth...');
  
  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'danilo@teste.com',
      password: '123',
      email_confirm: true,
      user_metadata: {
        name: 'danilo'
      }
    });
    
    if (error) {
      console.error('❌ Erro ao criar usuário no Auth:', error);
      return null;
    }
    
    console.log('✅ Usuário criado no Supabase Auth:', data.user);
    return data.user;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return null;
  }
}

// Função para sincronizar IDs entre tabela e Auth
async function syncUserIds(tableUser, authUser) {
  console.log('🔄 Sincronizando IDs...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ id: authUser.id })
      .eq('id', tableUser.id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao sincronizar IDs:', error);
      return false;
    }
    
    console.log('✅ IDs sincronizados:', data);
    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

// Função principal para configurar tudo
async function setupComplete() {
  console.log('🚀 INICIANDO CONFIGURAÇÃO COMPLETA');
  console.log('==================================');
  
  // 1. Testar conexão
  const connected = await testConnection();
  if (!connected) {
    console.error('❌ Não foi possível conectar ao Supabase');
    return;
  }
  
  // 2. Verificar/criar usuário na tabela
  let tableUser = await checkUsersTable();
  if (!tableUser) {
    tableUser = await createUserInTable();
    if (!tableUser) {
      console.error('❌ Não foi possível criar usuário na tabela');
      return;
    }
  }
  
  // 3. Verificar/criar usuário no Auth
  const authExists = await checkAuthUsers();
  let authUser = null;
  
  if (!authExists) {
    authUser = await createUserInAuth();
    if (!authUser) {
      console.error('❌ Não foi possível criar usuário no Auth');
      return;
    }
    
    // 4. Sincronizar IDs
    await syncUserIds(tableUser, authUser);
  }
  
  // 5. Teste final
  console.log('🧪 Testando login final...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'danilo@teste.com',
    password: '123'
  });
  
  if (error) {
    console.error('❌ Erro no teste final:', error);
  } else {
    console.log('🎉 SUCESSO! Login funcionando:', data.user);
  }
}

// Função para apenas testar login
async function testLogin() {
  console.log('🧪 Testando login...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'danilo@teste.com',
    password: '123'
  });
  
  if (error) {
    console.error('❌ Erro no login:', error);
  } else {
    console.log('✅ Login bem-sucedido:', data.user);
  }
}

// Exportar funções para uso
export {
  testConnection,
  checkUsersTable,
  createUserInTable,
  checkAuthUsers,
  createUserInAuth,
  syncUserIds,
  setupComplete,
  testLogin
};

// Executar se chamado diretamente
if (typeof window === 'undefined') {
  // Node.js
  setupComplete();
} else {
  // Browser
  console.log('📝 Scripts disponíveis:');
  console.log('- setupComplete() - Configuração completa');
  console.log('- testLogin() - Teste de login');
  console.log('- testConnection() - Teste de conexão');
  console.log('');
  console.log('⚠️ IMPORTANTE: Configure as credenciais do Supabase no início do arquivo!');
}
