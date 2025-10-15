# 🚀 Como Executar o Projeto ObraFlow

## 📋 Pré-requisitos
- Node.js instalado (versão 16 ou superior)
- npm ou yarn instalado

## 🔧 Passos para Executar

### 1. Instalar Dependências
```bash
cd project
npm install
```

### 2. Criar Arquivo de Configuração (Opcional)
Crie um arquivo `.env` na pasta `project` com suas configurações do Supabase:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Nota:** O projeto funcionará mesmo sem este arquivo, usando o sistema de login visual.

### 3. Executar o Projeto
```bash
npm run dev
```

### 4. Acessar no Navegador
O projeto estará disponível em: `http://localhost:5173`

## 🔑 Credenciais de Login

### Host (Administrador)
- **CNPJ:** 89.263.465/0001-49
- **Usuário:** danilo
- **Senha:** 123456

### Funcionários
- **Usuário:** Nome do funcionário (cadastrado pelo host)
- **Senha:** 123456 (padrão para todos)

## 🛠️ Solução de Problemas

### Se o projeto não carregar:
1. Verifique se o Node.js está instalado: `node --version`
2. Verifique se as dependências foram instaladas: `npm list`
3. Limpe o cache: `npm cache clean --force`
4. Reinstale as dependências: `rm -rf node_modules && npm install`

### Se houver erros de compilação:
1. Verifique se todos os arquivos estão salvos
2. Pare o servidor (Ctrl+C) e execute novamente: `npm run dev`
3. Verifique o console do navegador para erros específicos

## 📱 Funcionalidades Disponíveis

### Para Host:
- ✅ Login com credenciais fixas
- ✅ Cadastrar funcionários
- ✅ Gerenciar obras
- ✅ Gerenciar estabelecimentos
- ✅ Cadastrar equipamentos
- ✅ Visualizar relatórios

### Para Funcionários:
- ✅ Login com credenciais criadas pelo host
- ✅ Cadastrar equipamentos
- ✅ Transferir equipamentos entre obras
- ✅ Visualizar relatórios

## 🎯 Status do Projeto
- ✅ Sistema de autenticação visual funcionando
- ✅ Interface responsiva
- ✅ Controle de permissões por tipo de usuário
- ✅ Sistema de funcionários local
- ✅ Todas as páginas implementadas
