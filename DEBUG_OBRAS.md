# 🔧 Debug - Cadastro de Obras

## 🚨 Problema Identificado
O cadastro de obras não está funcionando. Possíveis causas:

## 🔍 Como Debugar

### 1. Verificar Console do Navegador
1. Abra o DevTools (F12)
2. Vá para a aba "Console"
3. Tente cadastrar uma obra
4. Verifique se há erros em vermelho

### 2. Verificar Network (Rede)
1. No DevTools, vá para a aba "Network"
2. Tente cadastrar uma obra
3. Verifique se há requisições falhando (vermelhas)

### 3. Verificar Dados do Usuário
O código agora verifica se o usuário está logado:
```javascript
if (!user?.id) {
  throw new Error('Usuário não identificado');
}
```

## 🛠️ Melhorias Implementadas

### 1. Validações Adicionadas
- ✅ Título obrigatório
- ✅ Endereço obrigatório
- ✅ Usuário deve estar logado
- ✅ Trim automático nos campos

### 2. Logs de Debug
- ✅ Console.log dos dados antes de enviar
- ✅ Console.log da resposta do Supabase
- ✅ Mensagens de erro específicas

### 3. Tratamento de Erros
- ✅ Try-catch em todas as operações
- ✅ Mensagens de erro específicas
- ✅ Feedback visual para o usuário

## 🔧 Possíveis Soluções

### Se o erro for de conexão com Supabase:
1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique se a tabela 'obras' existe no Supabase
3. Verifique se o usuário tem permissão para inserir dados

### Se o erro for de validação:
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Verifique se o usuário está logado corretamente

### Se o erro for de permissão:
1. Verifique se o usuário tem role 'host'
2. Verifique se o owner_id está sendo definido corretamente

## 📋 Estrutura Esperada da Tabela 'obras'

```sql
CREATE TABLE obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  endereco TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'ativa',
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Próximos Passos

1. Teste o cadastro de obra
2. Verifique o console para erros específicos
3. Se houver erro, me informe a mensagem exata
4. Verifique se a tabela 'obras' existe no Supabase
