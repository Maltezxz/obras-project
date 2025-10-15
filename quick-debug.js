// Cole este código no console do navegador (F12) para debug rápido

console.log('🔍 DEBUG RÁPIDO DO LOGIN');
console.log('========================');

// 1. Verificar variáveis de ambiente
console.log('\n1. Variáveis de ambiente:');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ OK' : '❌ FALTANDO');

// 2. Testar conexão
if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  const { createClient } = window.supabase;
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  console.log('\n2. Testando conexão...');
  
  // 3. Verificar usuário na tabela
  supabase.from('users')
    .select('*')
    .eq('cnpj', '89.263.465/0001-49')
    .eq('name', 'danilo')
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Erro na tabela users:', error);
      } else if (data) {
        console.log('✅ Usuário na tabela:', data);
        
        // 4. Testar login
        console.log('\n3. Testando login...');
        supabase.auth.signInWithPassword({
          email: data.email,
          password: '123'
        }).then(({ data: authData, error: authError }) => {
          if (authError) {
            console.error('❌ Erro no login:', authError);
            console.log('💡 SOLUÇÃO: Criar usuário no Supabase Auth');
          } else {
            console.log('✅ Login OK!', authData.user);
          }
        });
      } else {
        console.error('❌ Usuário não encontrado na tabela');
      }
    });
} else {
  console.error('❌ Configure o arquivo .env primeiro!');
}
