# Migração para Banco de Dados Local

## Resumo

O sistema foi migrado do Supabase (banco de dados em nuvem) para um banco de dados SQLite local que roda completamente no navegador usando a biblioteca `sql.js`.

## O Que Foi Feito

### 1. Instalação do sql.js
```bash
npm install sql.js
```

### 2. Criação do Sistema de Banco de Dados Local

**Arquivo**: `src/lib/database.ts`

- Sistema completo de banco de dados SQLite que roda no navegador
- Todos os dados são armazenados no `localStorage` do navegador
- Schema completo com todas as tabelas:
  - users
  - user_credentials
  - obras
  - estabelecimentos
  - ferramentas
  - movimentacoes
  - historico
  - obra_images
  - user_obra_permissions
  - user_ferramenta_permissions

### 3. Funções Auxiliares

**Arquivo**: `src/lib/db-helpers.ts`

Funções simplificadas para operações comuns:
- `getObrasByOwnerIds()`
- `getActiveObrasByOwnerIds()`
- `getFerramentasByOwnerIds()`
- `getDesaparecidasByOwnerIds()`
- `getEstabelecimentosByOwnerIds()`
- `getHistoricoByOwnerIds()`
- `createObra()`, `updateObra()`, `deleteObra()`
- `createFerramenta()`, `updateFerramenta()`, `deleteFerramenta()`
- E muitas outras...

### 4. Atualização do Sistema de Autenticação

**Arquivo**: `src/contexts/AuthContext.tsx`

- Removida dependência do Supabase
- Usa o banco local para autenticação
- Sistema de hash simples para senhas (btoa)

### 5. Atualização das Permissões

**Arquivo**: `src/utils/permissions.ts`

- Funções de permissão agora usam o banco local
- Mantém a mesma lógica de permissões por usuário

### 6. Compatibilidade Temporária

**Arquivo**: `src/lib/supabase-compat.ts`

- Stub do Supabase para páginas que ainda não foram completamente migradas
- Permite que o sistema compile e funcione enquanto a migração é concluída

## Dados Iniciais

O sistema cria automaticamente um usuário Host inicial:
- **Nome**: Fernando Antunes
- **Email**: fernando@pratica.eng.br
- **CNPJ**: 12345678000190
- **Senha**: senha123
- **Role**: host

## Vantagens da Migração

1. **Sem Dependências Externas**: Não precisa mais de conexão com servidores Supabase
2. **Dados Locais**: Todos os dados ficam no navegador do usuário
3. **Performance**: Queries mais rápidas por serem locais
4. **Privacidade**: Dados não saem do computador do usuário
5. **Sem Custos**: Não há custos de infraestrutura de banco de dados

## Desvantagens

1. **Dados por Navegador**: Os dados ficam apenas no navegador onde foram criados
2. **Sem Sincronização**: Não há sincronização entre diferentes dispositivos
3. **Limite de Armazenamento**: localStorage tem limite de ~10MB
4. **Sem Backup Automático**: Usuário precisa fazer backup manual exportando dados

## Como Usar

O banco de dados é inicializado automaticamente quando o usuário faz login. Todos os dados são salvos automaticamente no localStorage após cada operação.

## Próximos Passos Sugeridos

1. **Migrar Páginas Restantes**: Completar a migração das páginas que ainda usam o stub do Supabase
2. **Sistema de Backup**: Implementar exportação/importação de dados em JSON
3. **Validações**: Adicionar mais validações de dados
4. **Otimizações**: Adicionar cache em memória para queries frequentes
5. **Testes**: Criar testes unitários para o sistema de banco de dados

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── database.ts          # Sistema principal do banco SQLite
│   ├── db-helpers.ts        # Funções auxiliares para queries
│   └── supabase-compat.ts   # Compatibilidade temporária
├── contexts/
│   └── AuthContext.tsx      # Autenticação usando banco local
└── utils/
    └── permissions.ts       # Sistema de permissões atualizado
```

## Notas Importantes

- Os dados são armazenados no localStorage em formato JSON
- O banco é recriado a cada carregamento da página a partir dos dados salvos
- Todas as operações de INSERT, UPDATE e DELETE salvam automaticamente
- O sistema mantém compatibilidade com a estrutura anterior do Supabase

## Suporte

Para problemas ou dúvidas sobre a migração, verifique:
1. Console do navegador para erros
2. localStorage para verificar se os dados estão sendo salvos
3. Network tab não deve mostrar chamadas para Supabase
