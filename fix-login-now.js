// SCRIPT PARA CORRIGIR LOGIN AGORA
// Cole este código no console do navegador (F12) na página do seu projeto

console.log('🔧 CORRIGINDO PROBLEMA DE LOGIN');
console.log('===============================');

async function fixLoginNow() {
  try {
    // 1. Verificar se as variáveis de ambiente estão carregadas
    console.log('\n1️⃣ Verificando configuração...');
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ PROBLEMA: Arquivo .env não configurado!');
      console.log('💡 SOLUÇÃO:');
      console.log('1. Crie arquivo .env na pasta project/');
      console.log('2. Adicione:');
      console.log('   VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
      console.log('   VITE_SUPABASE_ANON_KEY=sua-chave-anonima');
      console.log('3. Reinicie o projeto (npm run dev)');
      return;
    }
    
    console.log('✅ Variáveis de ambiente OK');
    
    // 2. Criar cliente Supabase
    const { createClient } = window.supabase;
    const supabase = createClient(url, key);
    console.log('✅ Cliente Supabase criado');
    
    // 3. Verificar usuário na tabela
    console.log('\n2️⃣ Verificando usuário na tabela...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cnpj', '89.263.465/0001-49')
      .eq('name', 'danilo')
      .maybeSingle();
    
    if (userError) {
      console.error('❌ Erro na tabela users:', userError);
      console.log('💡 POSSÍVEIS CAUSAS:');
      console.log('- Tabela não existe');
      console.log('- Problemas de RLS');
      console.log('- Credenciais incorretas');
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
        console.error('❌ Erro ao criar usuário:', createError);
        return;
      }
      
      console.log('✅ Usuário criado na tabela:', newUser);
    } else {
      console.log('✅ Usuário encontrado na tabela:', userData);
    }
    
    // 4. Testar login
    console.log('\n3️⃣ Testando login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'danilo@teste.com',
      password: '123'
    });
    
    if (authError) {
      console.error('❌ ERRO NO LOGIN:', authError);
      
      if (authError.message.includes('Invalid login credentials')) {
        console.log('\n💡 SOLUÇÃO: Criar usuário no Supabase Auth');
        console.log('📋 PASSO A PASSO:');
        console.log('1. Acesse o Dashboard do Supabase');
        console.log('2. Vá para Authentication > Users');
        console.log('3. Clique em "Add user"');
        console.log('4. Preencha:');
        console.log('   - Email: danilo@teste.com');
        console.log('   - Password: 123');
        console.log('   - Auto Confirm User: ✅');
        console.log('5. Clique em "Create user"');
        console.log('6. Teste o login novamente');
        
        // Tentar criar via signUp como alternativa
        console.log('\n🔄 Tentando criar usuário via signUp...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'danilo@teste.com',
          password: '123',
          options: {
            data: { name: 'danilo' }
          }
        });
        
        if (signUpError) {
          console.error('❌ Erro no signUp:', signUpError);
        } else {
          console.log('✅ Usuário criado via signUp:', signUpData);
          console.log('📧 Verifique seu email para confirmar a conta');
        }
      }
    } else {
      console.log('🎉 SUCESSO! Login funcionando!');
      console.log('👤 Usuário autenticado:', authData.user);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para testar apenas o login
async function testLoginOnly() {
  console.log('🧪 TESTE RÁPIDO DE LOGIN');
  console.log('========================');
  
  const { createClient } = window.supabase;
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
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

// Função para verificar configuração
function checkConfig() {
  console.log('⚙️ VERIFICANDO CONFIGURAÇÃO');
  console.log('===========================');
  
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('URL do Supabase:', url);
  console.log('Chave do Supabase:', key ? '✅ Configurada' : '❌ Não encontrada');
  
  if (!url || !key) {
    console.log('\n💡 PARA CONFIGURAR:');
    console.log('1. Crie arquivo .env na pasta project/');
    console.log('2. Adicione suas credenciais do Supabase');
    console.log('3. Reinicie o projeto');
  }
}

// Executar automaticamente
console.log('🚀 Executando correção automática...');
fixLoginNow();

// Disponibilizar funções no console
window.fixLoginNow = fixLoginNow;
window.testLoginOnly = testLoginOnly;
window.checkConfig = checkConfig;

console.log('\n📝 FUNÇÕES DISPONÍVEIS:');
console.log('- fixLoginNow() - Correção completa');
console.log('- testLoginOnly() - Teste rápido');
console.log('- checkConfig() - Verificar configuração');
