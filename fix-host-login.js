// Script para corrigir login do host com as credenciais corretas
// Execute este código no console do navegador (F12) na página do seu projeto

console.log('🔧 CORRIGINDO LOGIN DO HOST');
console.log('============================');
console.log('Credenciais:');
console.log('- CNPJ: 89.263.465/0001-49');
console.log('- Usuário: danilo');
console.log('- Senha: 123456');

async function fixHostLogin() {
  try {
    // 1. Verificar configuração
    console.log('\n1️⃣ Verificando configuração...');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ PROBLEMA: Arquivo .env não configurado!');
      console.log('💡 SOLUÇÃO: Crie arquivo .env na pasta project/ com:');
      console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
      console.log('VITE_SUPABASE_ANON_KEY=sua-chave-anonima');
      return;
    }
    
    console.log('✅ Variáveis de ambiente OK');
    
    // 2. Criar cliente Supabase
    const { createClient } = window.supabase;
    const supabase = createClient(url, key);
    console.log('✅ Cliente Supabase criado');
    
    // 3. Verificar/criar usuário na tabela users
    console.log('\n2️⃣ Verificando usuário na tabela...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cnpj', '89.263.465/0001-49')
      .eq('name', 'danilo')
      .maybeSingle();
    
    if (userError) {
      console.error('❌ Erro na tabela users:', userError);
      return;
    }
    
    if (!userData) {
      console.log('⚠️ Usuário não encontrado na tabela. Criando...');
      
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
      
      console.log('✅ Usuário criado na tabela:', newUser);
    } else {
      console.log('✅ Usuário encontrado na tabela:', userData);
    }
    
    // 4. Testar login com senha 123456
    console.log('\n3️⃣ Testando login com senha 123456...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'danilo@teste.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ ERRO NO LOGIN:', authError);
      
      if (authError.message.includes('Invalid login credentials')) {
        console.log('\n💡 SOLUÇÃO: Criar usuário no Supabase Auth com senha 123456');
        console.log('📋 PASSO A PASSO:');
        console.log('1. Acesse o Dashboard do Supabase');
        console.log('2. Vá para Authentication > Users');
        console.log('3. Clique em "Add user"');
        console.log('4. Preencha:');
        console.log('   - Email: danilo@teste.com');
        console.log('   - Password: 123456');
        console.log('   - Auto Confirm User: ✅');
        console.log('5. Clique em "Create user"');
        
        // Tentar criar via signUp com senha 123456
        console.log('\n🔄 Tentando criar via signUp com senha 123456...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'danilo@teste.com',
          password: '123456',
          options: {
            data: { name: 'danilo' }
          }
        });
        
        if (signUpError) {
          console.error('❌ Erro no signUp:', signUpError);
          console.log('💡 POSSÍVEIS CAUSAS:');
          console.log('- Usuário já existe com senha diferente');
          console.log('- Políticas de senha do Supabase');
          console.log('- Email já confirmado');
        } else {
          console.log('✅ Usuário criado via signUp:', signUpData);
          console.log('📧 Verifique seu email para confirmar');
        }
      }
    } else {
      console.log('🎉 SUCESSO! Login funcionando com senha 123456!');
      console.log('👤 Usuário autenticado:', authData.user);
      
      // 5. Verificar se o usuário foi carregado corretamente
      console.log('\n4️⃣ Verificando carregamento do usuário...');
      const { data: loadedUser, error: loadError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
      
      if (loadError) {
        console.error('❌ Erro ao carregar usuário:', loadError);
      } else if (!loadedUser) {
        console.warn('⚠️ Usuário não encontrado com ID do Auth');
        console.log('💡 Tentando buscar por email...');
        
        const { data: userByEmail, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', authData.user.email)
          .maybeSingle();
        
        if (emailError) {
          console.error('❌ Erro ao buscar por email:', emailError);
        } else if (userByEmail) {
          console.log('✅ Usuário encontrado por email:', userByEmail);
          console.log('💡 IDs precisam ser sincronizados');
        }
      } else {
        console.log('✅ Usuário carregado com sucesso:', loadedUser);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para testar apenas o login
async function testLoginWithNewPassword() {
  console.log('🧪 TESTE RÁPIDO COM SENHA 123456');
  console.log('=================================');
  
  const { createClient } = window.supabase;
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'danilo@teste.com',
    password: '123456'
  });
  
  if (error) {
    console.error('❌ Erro no login:', error);
  } else {
    console.log('✅ Login bem-sucedido!', data.user);
  }
}

// Função para criar usuário no Supabase Auth
async function createHostUserInAuth() {
  console.log('🔐 CRIANDO USUÁRIO NO SUPABASE AUTH');
  console.log('===================================');
  
  const { createClient } = window.supabase;
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  try {
    // Tentar criar via signUp
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'danilo@teste.com',
      password: '123456',
      options: {
        data: { name: 'danilo' }
      }
    });
    
    if (signUpError) {
      console.error('❌ Erro no signUp:', signUpError);
      console.log('💡 Tente criar manualmente no Dashboard do Supabase');
    } else {
      console.log('✅ Usuário criado via signUp:', signUpData);
      console.log('📧 Verifique seu email para confirmar');
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar automaticamente
console.log('🚀 Executando correção do login do host...');
fixHostLogin();

// Disponibilizar funções no console
window.fixHostLogin = fixHostLogin;
window.testLoginWithNewPassword = testLoginWithNewPassword;
window.createHostUserInAuth = createHostUserInAuth;

console.log('\n📝 FUNÇÕES DISPONÍVEIS:');
console.log('- fixHostLogin() - Correção completa');
console.log('- testLoginWithNewPassword() - Teste rápido');
console.log('- createHostUserInAuth() - Criar usuário no Auth');
