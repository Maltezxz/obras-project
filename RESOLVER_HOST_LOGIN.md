# 🔧 Resolver Login do Host - Credenciais Corretas

## 🎯 Problema Identificado
Você está tentando fazer login com:
- **CNPJ:** `89.263.465/0001-49`
- **Usuário:** `danilo`
- **Senha:** `123456`

Mas o sistema estava configurado para senha `123`.

## 🚀 Solução Passo a Passo

### **Passo 1: Executar Script de Correção**
1. **Abra seu projeto no navegador** (`npm run dev`)
2. **Pressione F12** para abrir o DevTools
3. **Vá para a aba Console**
4. **Cole e execute este código:**

```javascript
// CORREÇÃO DO LOGIN DO HOST - Cole no console
async function fixHostLogin() {
  try {
    console.log('🔧 CORRIGINDO LOGIN DO HOST');
    console.log('Credenciais: CNPJ: 89.263.465/0001-49, Usuário: danilo, Senha: 123456');
    
    const { createClient } = window.supabase;
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    
    // Verificar usuário na tabela
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('cnpj', '89.263.465/0001-49')
      .eq('name', 'danilo')
      .maybeSingle();
    
    if (userError) {
      console.error('❌ Erro na tabela:', userError);
      return;
    }
    
    if (!userData) {
      console.log('⚠️ Criando usuário na tabela...');
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
      console.log('✅ Usuário criado na tabela');
    } else {
      console.log('✅ Usuário encontrado na tabela');
    }
    
    // Testar login com senha 123456
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'danilo@teste.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ ERRO NO LOGIN:', authError);
      console.log('💡 SOLUÇÃO: Criar usuário no Supabase Auth');
      console.log('📋 PASSO A PASSO:');
      console.log('1. Acesse o Dashboard do Supabase');
      console.log('2. Vá para Authentication > Users');
      console.log('3. Clique em "Add user"');
      console.log('4. Preencha:');
      console.log('   - Email: danilo@teste.com');
      console.log('   - Password: 123456');
      console.log('   - Auto Confirm User: ✅');
      console.log('5. Clique em "Create user"');
      
      // Tentar criar via signUp
      console.log('🔄 Tentando criar via signUp...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'danilo@teste.com',
        password: '123456',
        options: { data: { name: 'danilo' } }
      });
      
      if (signUpError) {
        console.error('❌ Erro no signUp:', signUpError);
      } else {
        console.log('✅ Usuário criado via signUp');
        console.log('📧 Verifique seu email para confirmar');
      }
    } else {
      console.log('🎉 SUCESSO! Login funcionando!');
      console.log('👤 Usuário:', authData.user);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixHostLogin();
```

### **Passo 2: Se Ainda Não Funcionar**

**Opção A - Via Dashboard do Supabase (Recomendado):**
1. Acesse https://supabase.com
2. Vá para seu projeto
3. **Authentication > Users > Add user**
4. Preencha:
   - **Email:** `danilo@teste.com`
   - **Password:** `123456`
   - **Auto Confirm User:** ✅
5. Clique em **"Create user"**

**Opção B - Via SQL Editor:**
1. Acesse o SQL Editor no Supabase
2. Execute este código:
```sql
-- Inserir usuário host
INSERT INTO users (name, email, cnpj, role, created_at, updated_at)
VALUES (
  'danilo',
  'danilo@teste.com',
  '89.263.465/0001-49',
  'host',
  now(),
  now()
);
```

### **Passo 3: Testar Login Final**
1. Acesse a página de login
2. Use as credenciais:
   - **CNPJ:** `89.263.465/0001-49`
   - **Usuário:** `danilo`
   - **Senha:** `123456`

## 🔍 Debug Rápido

**Para testar apenas o login:**
```javascript
// Teste rápido - Cole no console
const { createClient } = window.supabase;
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

supabase.auth.signInWithPassword({
  email: 'danilo@teste.com',
  password: '123456'
}).then(result => {
  if (result.error) {
    console.error('❌ Erro:', result.error);
  } else {
    console.log('✅ Login OK!', result.data.user);
  }
});
```

## ✅ Checklist Final

- [ ] Arquivo `.env` configurado com credenciais do Supabase
- [ ] Usuário existe na tabela `users`
- [ ] Usuário existe no Supabase Auth com senha `123456`
- [ ] Login testado com sucesso
- [ ] Componente Login atualizado com senha `123456`

## 🆘 Se Nada Funcionar

1. **Verifique se o projeto Supabase está ativo**
2. **Confirme se as credenciais estão corretas**
3. **Verifique os logs do Supabase Dashboard**
4. **Teste com um usuário completamente novo**

## 📞 Suporte

Se ainda houver problemas, execute o script de debug e me envie o resultado do console!
