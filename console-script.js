// Script para executar no console do navegador (F12)
// Cole este código no console do seu projeto em execução

async function setupHostUser() {
  console.log('🚀 Configurando usuário host...');
  
  // Importar o cliente Supabase (já disponível no projeto)
  const { createClient } = window.supabase || {};
  
  if (!createClient) {
    console.error('❌ Supabase não está disponível. Certifique-se de que o projeto está rodando.');
    return;
  }

  // Usar as variáveis de ambiente do projeto
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas.');
    console.log('💡 Certifique-se de que o arquivo .env está configurado corretamente.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. Verificar se o usuário existe na tabela users
    console.log('📋 Verificando usuário na tabela users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cnpj', '89.263.465/0001-49')
      .eq('name', 'danilo')
      .maybeSingle();

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }

    if (!userData) {
      console.log('⚠️ Usuário não encontrado na tabela users. Criando...');
      
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
      
      console.log('✅ Usuário criado na tabela users:', newUser);
    } else {
      console.log('✅ Usuário encontrado na tabela users:', userData);
    }

    // 2. Testar login
    console.log('🔐 Testando login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'danilo@teste.com',
      password: '123'
    });

    if (authError) {
      console.error('❌ Erro no login:', authError);
      console.log('💡 O usuário precisa ser criado no Supabase Auth primeiro.');
      console.log('📝 Vá para o Dashboard do Supabase > Authentication > Users > Add user');
      console.log('📧 Email: danilo@teste.com');
      console.log('🔑 Password: 123');
      return;
    }

    console.log('🎉 SUCESSO! Login funcionando!');
    console.log('👤 Usuário autenticado:', authData.user);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Função para testar apenas o login
async function testLogin() {
  console.log('🧪 Testando login...');
  
  const { createClient } = window.supabase || {};
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
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

// Executar
console.log('📝 Scripts disponíveis:');
console.log('- setupHostUser() - Configurar usuário host completo');
console.log('- testLogin() - Testar apenas o login');
console.log('');
console.log('🚀 Executando setupHostUser()...');
setupHostUser();
