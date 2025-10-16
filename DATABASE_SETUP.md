# Configuração do Banco de Dados

## Autenticação Customizada

Este projeto usa autenticação customizada **sem Supabase Auth**. Por isso, todas as políticas RLS foram configuradas de forma permissiva.

## Estrutura do Banco

### Tabelas Principais

1. **users** - Armazena usuários (hosts e funcionários)
2. **user_credentials** - Armazena senhas com hash simples (base64)
3. **obras** - Projetos de construção
4. **ferramentas** - Equipamentos e ferramentas
5. **estabelecimentos** - Locais de armazenamento
6. **movimentacoes** - Histórico de movimentação de ferramentas
7. **obra_images** - Imagens das obras

## Políticas RLS

**IMPORTANTE**: Como não usamos `auth.uid()` do Supabase Auth, todas as tabelas têm políticas permissivas:

```sql
CREATE POLICY "Allow all operations on [table]"
  ON [table] FOR ALL
  USING (true)
  WITH CHECK (true);
```

Isso significa que:
- ✅ Qualquer operação é permitida no banco de dados
- ❌ A segurança deve ser implementada na camada da aplicação
- ⚠️ O controle de acesso é feito pelo código, não pelo banco

## Host Inicial

O host inicial já está cadastrado no banco:

- **CNPJ**: 04.205.151/0001-37
- **Nome**: Fernando Antunes
- **Senha**: 123456 (hash: MTIzNDU2)
- **ID**: a1b2c3d4-e5f6-7890-abcd-ef1234567890

## Como Funciona o Login

1. Cliente busca usuário por CNPJ e nome na tabela `users`
2. Sistema busca hash da senha na tabela `user_credentials`
3. Compara o hash da senha digitada com o hash armazenado
4. Se válido, armazena o ID do usuário no sessionStorage

## Avisos de Segurança

⚠️ **ATENÇÃO**: Este setup é adequado para desenvolvimento/demonstração.

Para produção, considere:

1. Usar Supabase Auth com RLS adequado
2. Implementar hash de senha forte (bcrypt, argon2)
3. Adicionar rate limiting
4. Implementar logs de auditoria
5. Restringir políticas RLS com base em regras de negócio

## Migrações Aplicadas

Todas as migrações na pasta `supabase/migrations/` foram aplicadas, incluindo:

1. `20251015211711_create_initial_schema.sql` - Schema inicial
2. `20251016173054_add_tipo_to_ferramentas.sql` - Campo tipo em ferramentas
3. `add_user_credentials_table` - Tabela de credenciais
4. `allow_public_read_for_login` - Permite leitura pública na tabela users
5. `simplify_all_rls_policies` - Simplifica todas as políticas RLS

## Troubleshooting

### Erro: "new row violates row-level security policy"

**Causa**: Políticas RLS muito restritivas
**Solução**: As políticas foram simplificadas para permitir todas as operações

### Erro: "Usuário não encontrado"

**Causa**: Tabela users não permite leitura pública
**Solução**: Política de leitura pública foi adicionada

### Erro: "relation does not exist"

**Causa**: Migrações não foram aplicadas
**Solução**: Execute as migrações através do Supabase Dashboard ou MCP tools
