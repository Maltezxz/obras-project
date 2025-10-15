# 🚨 Troubleshooting: "Credenciais Erradas"

## 🔍 Diagnóstico Passo a Passo

### Passo 1: Verificar Configuração Básica
Execute no console do navegador (F12):
```javascript
// Verificar se as variáveis estão carregadas
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Se aparecer `undefined`:**
- ❌ Arquivo `.env` não existe ou está mal configurado
- ✅ **Solução:** Criar arquivo `.env` na pasta `project/`

### Passo 2: Verificar Usuário na Tabela
Execute no console:
```javascript
const { createClient } = window.supabase;
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

supabase.from('users')
  .select('*')
  .eq('cnpj', '89.263.465/0001-49')
  .eq('name', 'danilo')
  .maybeSingle()
  .then(result => console.log('Usuário na tabela:', result));
```

**Se der erro:**
- ❌ Problema de conexão com Supabase
- ❌ Tabela não existe
- ❌ Problemas de RLS

**Se não encontrar usuário:**
- ❌ Usuário não existe na tabela
- ✅ **Solução:** Executar `seed.sql` no SQL Editor

### Passo 3: Verificar Usuário no Supabase Auth
Execute no console:
```javascript
supabase.auth.signInWithPassword({
  email: 'danilo@teste.com',
  password: '123'
}).then(result => {
  if (result.error) {
    console.error('Erro:', result.error);
  } else {
    console.log('Login OK:', result.data);
  }
});
```

## 🎯 Possíveis Causas do Erro "Credenciais Erradas"

### 1. **Usuário não existe no Supabase Auth**
**Sintoma:** Erro "Invalid login credentials"
**Solução:**
- Dashboard > Authentication > Users > Add user
- Email: `danilo@teste.com`
- Password: `123`
- Auto Confirm: ✅

### 2. **Email não confirmado**
**Sintoma:** Erro "Email not confirmed"
**Solução:**
- Verificar email de confirmação
- Ou confirmar manualmente no Dashboard

### 3. **Senha incorreta**
**Sintoma:** Erro "Invalid login credentials"
**Solução:**
- Verificar se a senha é realmente `123`
- Ou resetar senha no Dashboard

### 4. **Problemas de RLS (Row Level Security)**
**Sintoma:** Erro de permissão ao buscar usuário
**Solução:**
- Verificar políticas RLS no Supabase
- Temporariamente desabilitar RLS para teste

### 5. **ID não corresponde entre tabela e Auth**
**Sintoma:** Login OK mas não carrega usuário
**Solução:**
- Verificar se o ID da tabela `users` corresponde ao ID do Auth
- Atualizar ID na tabela se necessário

## 🔧 Scripts de Correção

### Script 1: Verificar Tudo
```javascript
async function verificarTudo() {
  console.log('🔍 Verificando configuração...');
  
  // 1. Variáveis
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log('Variáveis:', url ? '✅' : '❌', key ? '✅' : '❌');
  
  if (!url || !key) {
    console.error('❌ Configure o .env primeiro!');
    return;
  }
  
  // 2. Conexão
  const { createClient } = window.supabase;
  const supabase = createClient(url, key);
  
  // 3. Usuário na tabela
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('cnpj', '89.263.465/0001-49')
    .eq('name', 'danilo')
    .maybeSingle();
  
  console.log('Usuário na tabela:', user ? '✅' : '❌', userError);
  
  if (!user) {
    console.error('❌ Usuário não encontrado na tabela!');
    return;
  }
  
  // 4. Login
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: '123'
  });
  
  console.log('Login:', auth ? '✅' : '❌', authError);
  
  if (authError) {
    console.log('💡 Crie o usuário no Supabase Auth!');
  }
}

verificarTudo();
```

### Script 2: Criar Usuário no Auth
```javascript
async function criarUsuarioAuth() {
  const { createClient } = window.supabase;
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  
  const { data, error } = await supabase.auth.signUp({
    email: 'danilo@teste.com',
    password: '123',
    options: {
      data: { name: 'danilo' }
    }
  });
  
  if (error) {
    console.error('Erro:', error);
  } else {
    console.log('Usuário criado:', data);
    console.log('Verifique o email para confirmar!');
  }
}

criarUsuarioAuth();
```

## 📞 Próximos Passos

1. **Execute o script de verificação**
2. **Identifique qual é o problema específico**
3. **Aplique a solução correspondente**
4. **Teste novamente o login**

## 🆘 Se Nada Funcionar

1. Verifique os logs do Supabase Dashboard
2. Teste com um usuário completamente novo
3. Verifique se o projeto Supabase está ativo
4. Confirme se as credenciais estão corretas
