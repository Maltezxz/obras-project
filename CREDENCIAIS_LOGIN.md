# Credenciais de Login

## Usuário Padrão (Host)

Após a migração para o banco de dados local, o sistema cria automaticamente um usuário Host:

### Dados de Acesso

```
CNPJ: 04.205.151/0001-37 (pré-preenchido e bloqueado)
Nome de Usuário: Fernando Antunes
Senha: senha123
```

### Tipo de Conta
- **Role**: Host (Engenheiro)
- **Permissões**: Acesso total ao sistema
- **CNPJ da Empresa**: 04.205.151/0001-37

### Observação Importante
- O campo CNPJ está pré-preenchido e **não pode ser alterado**
- Todos os usuários do sistema usam o mesmo CNPJ da empresa
- Apenas digite o nome de usuário e senha para fazer login

## Importante

- Este usuário é criado automaticamente na primeira inicialização do banco de dados
- Os dados são armazenados no localStorage do navegador
- Para resetar e criar novamente, limpe o localStorage:
  ```javascript
  localStorage.removeItem('obrasflow_database');
  location.reload();
  ```

## Criando Novos Usuários

Depois de fazer login como Host, você pode:

1. Acessar a página "Usuários"
2. Clicar em "Adicionar Funcionário" ou "Adicionar Host"
3. Preencher os dados:
   - Nome
   - Email
   - Senha
   - Tipo (Funcionário ou Host)

### Tipos de Usuário

**Host (Engenheiro)**
- Acesso total ao sistema
- Pode criar e gerenciar obras
- Pode cadastrar e gerenciar ferramentas
- Pode adicionar/remover funcionários
- Pode gerenciar outros hosts da mesma empresa (mesmo CNPJ)

**Funcionário**
- Acesso limitado baseado em permissões
- Precisa ter permissões atribuídas pelo Host para acessar obras e ferramentas
- Não pode criar outros usuários
- Vinculado ao Host que o criou

## Primeiro Acesso

1. Abra o sistema no navegador
2. Use as credenciais acima para fazer login
3. Você será redirecionado para a Home
4. Explore as funcionalidades do sistema

## Esqueci a Senha

Como o sistema agora é local, não há recuperação de senha. Você pode:

1. Resetar o banco de dados completamente:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. Ou modificar a senha manualmente no localStorage (avançado)

## Múltiplos Hosts

Se você criar outros usuários Host com o mesmo CNPJ, eles terão acesso às mesmas obras e ferramentas, mas cada um pode ter seus próprios funcionários.

## Segurança

**Nota**: A senha é armazenada usando uma codificação simples (base64). Em um ambiente de produção real, você deveria:

- Usar um hash mais seguro (bcrypt, argon2, etc.)
- Implementar autenticação de dois fatores
- Adicionar expiração de sessão
- Implementar bloqueio após tentativas falhadas

Para o uso local e demonstração, a segurança atual é suficiente.
