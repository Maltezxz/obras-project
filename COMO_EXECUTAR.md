# Como Executar o Sistema

## Requisitos
- Node.js instalado (versão 16 ou superior)
- npm (vem com o Node.js)

## Passos para Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em: `http://localhost:5173`

### 3. Fazer Login

O sistema abrirá a tela de login com os seguintes dados:

**CNPJ**: `04.205.151/0001-37` (já vem pré-preenchido e bloqueado)
**Usuário**: `Fernando Antunes`
**Senha**: `senha123`

> O campo CNPJ não pode ser alterado. Todos os usuários do sistema usam o mesmo CNPJ da empresa.

## Build para Produção

Para criar uma versão otimizada para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

## Verificar Tipos TypeScript

Para verificar erros de tipos sem compilar:

```bash
npm run typecheck
```

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── pages/          # Páginas da aplicação
│   ├── Dashboard.tsx   # Layout principal
│   ├── Login.tsx       # Tela de login
│   └── Sidebar.tsx     # Menu lateral
├── contexts/           # Contextos React (Auth, Refresh)
├── hooks/              # Hooks customizados
├── lib/                # Bibliotecas e utilitários
│   ├── database.ts     # Banco de dados SQLite local
│   ├── db-helpers.ts   # Funções auxiliares do banco
│   └── supabase-compat.ts  # Compatibilidade temporária
├── types/              # Tipos TypeScript
└── utils/              # Utilitários gerais
```

## Banco de Dados

O sistema usa **SQLite local** que roda completamente no navegador:
- Dados armazenados no `localStorage`
- Não precisa de servidor de banco de dados
- Tudo funciona offline

### Limpar Banco de Dados

Para resetar o banco e começar do zero:

1. Abra o Console do navegador (F12)
2. Execute:
   ```javascript
   localStorage.clear();
   location.reload();
   ```

## Importante

- Os dados são salvos apenas no navegador onde você usa o sistema
- Cada navegador/dispositivo terá seus próprios dados
- Para backup, você pode exportar os dados do localStorage
- O sistema funciona completamente offline

## Problemas Comuns

### Erro ao instalar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Porta 5173 já está em uso
O Vite escolherá automaticamente a próxima porta disponível (5174, 5175, etc.)

### Não consigo fazer login
- Verifique se digitou o usuário e senha corretos
- Tente limpar o localStorage e recarregar a página
- Verifique o Console do navegador para mensagens de erro

## Suporte

Para mais informações, consulte:
- `MIGRACAO_BANCO_LOCAL.md` - Detalhes técnicos da migração
- `COMO_USAR.md` - Guia de uso do sistema
- `CREDENCIAIS_LOGIN.md` - Informações de login
