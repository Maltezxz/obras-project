# Instruções para Resolver o Problema de Login

## Problema Identificado
O sistema de login não está funcionando porque:
1. Faltam as configurações do Supabase
2. Não existe usuário host criado no Supabase Auth
3. O fluxo de autenticação estava complexo demais

## Soluções Implementadas

### 1. Configuração do Supabase
- Criado arquivo `env-example.txt` com template das variáveis de ambiente
- **AÇÃO NECESSÁRIA**: Crie um arquivo `.env` na pasta `project/` com suas credenciais do Supabase

### 2. Dados Iniciais
- Criado script `supabase/seed.sql` para inserir usuário host na tabela `users`
- Criado script `create-host-user.js` para criar usuário no Supabase Auth

### 3. Fluxo de Autenticação Simplificado
- Removida a lógica complexa de criação automática de usuários
- Adicionados logs detalhados para debug
- Melhor tratamento de erros

## Passos para Resolver

### Passo 1: Configurar Variáveis de Ambiente
1. Acesse https://supabase.com
2. Vá para seu projeto
3. Em Settings > API, copie:
   - Project URL
   - anon public key
4. Crie arquivo `.env` na pasta `project/` com:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Passo 2: Criar Usuário Host no Banco
1. Acesse o SQL Editor no Supabase
2. Execute o script `supabase/seed.sql`
3. Verifique se o usuário foi criado na tabela `users`

### Passo 3: Criar Usuário no Supabase Auth
**Opção A - Via Dashboard do Supabase:**
1. Vá para Authentication > Users
2. Clique em "Add user"
3. Email: `danilo@teste.com`
4. Password: `123`
5. Confirme o email automaticamente

**Opção B - Via Script (requer service key):**
1. Obtenha a service key em Settings > API
2. Execute o script `create-host-user.js` com as credenciais corretas

### Passo 4: Testar o Login
1. Inicie o projeto: `npm run dev`
2. Tente fazer login com:
   - CNPJ: `89.263.465/0001-49`
   - Usuário: `danilo`
   - Senha: `123`

## Verificações de Debug

### Console do Navegador
Abra o DevTools (F12) e verifique:
- Se as variáveis de ambiente estão carregadas
- Se há erros de conexão com o Supabase
- Logs detalhados do processo de login

### Supabase Dashboard
Verifique em:
- Authentication > Users: se o usuário existe
- Table Editor > users: se o usuário host está na tabela
- Logs: se há erros de RLS ou permissões

## Possíveis Problemas Adicionais

### RLS (Row Level Security)
Se ainda houver problemas, pode ser necessário ajustar as políticas RLS:
- Verifique se o usuário autenticado tem permissão para ler a tabela `users`
- Considere temporariamente desabilitar RLS para testes

### Políticas de Autenticação
- Verifique se o email está confirmado no Supabase Auth
- Confirme se não há restrições de domínio nas configurações de autenticação

## Contato
Se o problema persistir, verifique:
1. Logs do console do navegador
2. Logs do Supabase
3. Configurações de RLS
4. Status da conexão com o Supabase
