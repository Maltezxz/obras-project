// Script de Debug Completo para Login
// Execute este código no console do navegador (F12) na página do seu projeto

async function debugLogin() {
  console.log('🔍 INICIANDO DEBUG COMPLETO DO LOGIN');
  console.log('=====================================');
  
  // 1. Verificar se as variáveis de ambiente estão carregadas
  console.log('\n📋 1. VERIFICANDO VARIÁVEIS DE AMBIENTE');
  console.log('----------------------------------------');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('URL do Supabase:', supabaseUrl);
  console.log('Chave do Supabase:', supabaseKey ? '✅ Carregada' : '❌ Não encontrada');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ PROBLEMA: Variáveis de ambiente não encontradas!');
    console.log('💡 SOLUÇÃO: Crie o arquivo .env na pasta project/ com:');
    console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
    console.log('VITE_SUPABASE_ANON_KEY=sua-chave-anonima');
    return;
  }
  
  // 2. Testar conexão com Supabase
  console.log('\n🔌 2. TESTANDO CONEXÃO COM SUPABASE');
  console.log('-----------------------------------');
  
  try {
    const { createClient } = window.supabase;
    if (!createClient) {
      console.error('❌ PROBLEMA: Supabase não está disponível no window');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Cliente Supabase criado com sucesso');
    
    // 3. Verificar se o usuário existe na tabela users
    console.log('\n👤 3. VERIFICANDO USUÁRIO NA TABELA USERS');
    console.log('----------------------------------------');
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cnpj', '89.263.465/0001-49')
      .eq('name', 'danilo')
      .maybeSingle();
    
    if (userError) {
      console.error('❌ ERRO ao buscar usuário na tabela:', userError);
      console.log('💡 POSSÍVEIS CAUSAS:');
      console.log('- Tabela users não existe');
      console.log('- Problemas de RLS (Row Level Security)');
      console.log('- Credenciais incorretas do Supabase');
      return;
    }
    
    if (!userData) {
      console.error('❌ PROBLEMA: Usuário não encontrado na tabela users!');
      console.log('💡 SOLUÇÃO: Execute o script seed.sql no SQL Editor do Supabase');
      return;
    }
    
    console.log('✅ Usuário encontrado na tabela users:');
    console.log('   ID:', userData.id);
    console.log('   Nome:', userData.name);
    console.log('   Email:', userData.email);
    console.log('   CNPJ:', userData.cnpj);
    console.log('   Role:', userData.role);
    
    // 4. Testar login no Supabase Auth
    console.log('\n🔐 4. TESTANDO LOGIN NO SUPABASE AUTH');
    console.log('-------------------------------------');
    
    console.log('Tentando login com:');
    console.log('   Email:', userData.email);
    console.log('   Senha: 123');
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userData.email,
      password: '123'
    });
    
    if (authError) {
      console.error('❌ ERRO no login:', authError);
      console.log('💡 POSSÍVEIS CAUSAS:');
      
      if (authError.message.includes('Invalid login credentials')) {
        console.log('- Usuário não existe no Supabase Auth');
        console.log('- Senha incorreta');
        console.log('- Email não confirmado');
      } else if (authError.message.includes('Email not confirmed')) {
        console.log('- Email não foi confirmado');
      } else {
        console.log('- Erro desconhecido:', authError.message);
      }
      
      console.log('\n🔧 SOLUÇÕES:');
      console.log('1. Criar usuário no Supabase Auth:');
      console.log('   - Dashboard > Authentication > Users > Add user');
      console.log('   - Email: danilo@teste.com');
      console.log('   - Password: 123');
      console.log('   - Auto Confirm: ✅');
      
      console.log('\n2. Ou usar o script de criação:');
      console.log('   - Execute createHostUser() no console');
      
    } else {
      console.log('✅ LOGIN BEM-SUCEDIDO!');
      console.log('👤 Usuário autenticado:', authData.user);
      console.log('🎉 O problema está resolvido!');
    }
    
    // 5. Verificar se o loadUser funciona
    if (authData && !authError) {
      console.log('\n🔄 5. TESTANDO LOADUSER');
      console.log('----------------------');
      
      const { data: loadedUser, error: loadError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (loadError) {
        console.error('❌ ERRO ao carregar usuário:', loadError);
      } else if (!loadedUser) {
        console.error('❌ PROBLEMA: Usuário não encontrado após login!');
        console.log('💡 O ID do Auth não corresponde ao ID da tabela users');
      } else {
        console.log('✅ Usuário carregado com sucesso:', loadedUser);
      }
    }
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error);
  }
}

// Função para criar usuário no Supabase Auth
async function createHostUser() {
  console.log('🔧 CRIANDO USUÁRIO NO SUPABASE AUTH');
  console.log('===================================');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não encontradas');
    return;
  }
  
  const { createClient } = window.supabase;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Primeiro, verificar se o usuário já existe
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: 'danilo@teste.com',
      password: '123'
    });
    
    if (existingUser) {
      console.log('✅ Usuário já existe no Supabase Auth!');
      return;
    }
  } catch (error) {
    console.log('⚠️ Usuário não existe, tentando criar...');
  }
  
  // Tentar criar usuário via signUp
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: 'danilo@teste.com',
    password: '123',
    options: {
      data: {
        name: 'danilo'
      }
    }
  });
  
  if (signUpError) {
    console.error('❌ Erro ao criar usuário:', signUpError);
    console.log('💡 Tente criar manualmente no Dashboard do Supabase');
  } else {
    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Verifique seu email para confirmar a conta');
    console.log('💡 Ou vá para o Dashboard e confirme manualmente');
  }
}

// Função para testar apenas o login
async function testLoginOnly() {
  console.log('🧪 TESTE RÁPIDO DE LOGIN');
  console.log('========================');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não encontradas');
    return;
  }
  
  const { createClient } = window.supabase;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'danilo@teste.com',
    password: '123'
  });
  
  if (error) {
    console.error('❌ Erro no login:', error);
  } else {
    console.log('✅ Login bem-sucedido!', data.user);
  }
}

// Executar debug
console.log('🚀 SCRIPTS DISPONÍVEIS:');
console.log('- debugLogin() - Debug completo');
console.log('- createHostUser() - Criar usuário no Auth');
console.log('- testLoginOnly() - Teste rápido de login');
console.log('');
console.log('🔍 Executando debug completo...');
debugLogin();
