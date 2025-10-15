// Script para configurar usuário host completo
// Execute este script no console do navegador (F12) na página do seu projeto

import { createClient } from '@supabase/supabase-js';

// IMPORTANTE: Substitua estas variáveis pelas suas credenciais do Supabase
const SUPABASE_URL = 'SUA_URL_DO_SUPABASE_AQUI';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
const SUPABASE_SERVICE_KEY = 'SUA_SERVICE_KEY_AQUI'; // Para operações administrativas

// Cliente com anon key (para operações normais)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente com service key (para operações administrativas)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupHostUser() {
  console.log('🚀 Iniciando configuração do usuário host...');
  
  try {
    // Passo 1: Verificar se o usuário já existe na tabela users
    console.log('📋 Verificando usuário na tabela users...');
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cnpj', '89.263.465/0001-49')
      .eq('name', 'danilo')
      .maybeSingle();

    if (userError) {
      console.error('❌ Erro ao verificar usuário:', userError);
      return;
    }

    if (existingUser) {
      console.log('✅ Usuário encontrado na tabela users:', existingUser);
    } else {
      console.log('⚠️ Usuário não encontrado na tabela users. Criando...');
      
      // Criar usuário na tabela users
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          name: 'danilo',
          email: 'danilo@teste.com',
          cnpj: '89.263.465/0001-49',
          role: 'host'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar usuário na tabela:', createError);
        return;
      }
      
      console.log('✅ Usuário criado na tabela users:', newUser);
    }

    // Passo 2: Verificar se o usuário existe no Supabase Auth
    console.log('🔐 Verificando usuário no Supabase Auth...');
    
    try {
      // Tentar fazer login para verificar se o usuário existe
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'danilo@teste.com',
        password: '123'
      });

      if (authData && !authError) {
        console.log('✅ Usuário já existe no Supabase Auth e senha está correta!');
        console.log('🎉 Login funcionando!');
        return;
      }
    } catch (error) {
      console.log('⚠️ Usuário não existe no Supabase Auth ou senha incorreta');
    }

    // Passo 3: Criar usuário no Supabase Auth (requer service key)
    console.log('🔧 Criando usuário no Supabase Auth...');
    
    const { data: authUser, error: authCreateError } = await supabaseAdmin.auth.admin.createUser({
      email: 'danilo@teste.com',
      password: '123',
      email_confirm: true,
      user_metadata: {
        name: 'danilo'
      }
    });

    if (authCreateError) {
      console.error('❌ Erro ao criar usuário no Auth:', authCreateError);
      console.log('💡 Dica: Verifique se você tem a service key correta');
      return;
    }

    console.log('✅ Usuário criado no Supabase Auth:', authUser.user);

    // Passo 4: Atualizar ID na tabela users para corresponder ao Auth
    console.log('🔄 Atualizando ID do usuário na tabela...');
    
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ id: authUser.user.id })
      .eq('email', 'danilo@teste.com');

    if (updateError) {
      console.error('❌ Erro ao atualizar ID:', updateError);
      return;
    }

    console.log('✅ ID atualizado na tabela users');

    // Passo 5: Testar login final
    console.log('🧪 Testando login final...');
    
    const { data: finalAuth, error: finalError } = await supabase.auth.signInWithPassword({
      email: 'danilo@teste.com',
      password: '123'
    });

    if (finalError) {
      console.error('❌ Erro no teste final:', finalError);
      return;
    }

    console.log('🎉 SUCESSO! Usuário host configurado e login funcionando!');
    console.log('📊 Dados do usuário:', finalAuth.user);

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para testar apenas o login
async function testLogin() {
  console.log('🧪 Testando login...');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'danilo@teste.com',
      password: '123'
    });

    if (error) {
      console.error('❌ Erro no login:', error);
    } else {
      console.log('✅ Login bem-sucedido!', data.user);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar a configuração
console.log('📝 Para usar este script:');
console.log('1. Substitua as variáveis SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_KEY');
console.log('2. Execute: setupHostUser()');
console.log('3. Para testar apenas o login: testLogin()');

// Descomente a linha abaixo para executar automaticamente
// setupHostUser();
