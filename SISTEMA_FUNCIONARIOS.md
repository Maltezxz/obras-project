# 👥 Sistema de Funcionários - ObrasFlow

## 🎯 Funcionalidades Implementadas

### **Para o Host (danilo):**
- ✅ **Login:** CNPJ: `89.263.465/0001-49`, Usuário: `danilo`, Senha: `123456`
- ✅ **Cadastrar funcionários** na página "Cadastro de Usuário"
- ✅ **Gerenciar obras** e estabelecimentos
- ✅ **Acesso completo** a todas as funcionalidades
- ✅ **Visualizar relatórios** de todas as atividades

### **Para Funcionários:**
- ✅ **Login:** Usuário: `Nome do funcionário`, Senha: `123456`
- ✅ **Cadastrar ferramentas** na página "Cadastro de Equipamento"
- ✅ **Transferir ferramentas** entre obras
- ✅ **Visualizar relatórios** de movimentações
- ✅ **Acesso limitado** apenas às funcionalidades de ferramentas

## 🚀 Como Usar o Sistema

### **1. Login do Host**
1. Acesse a tela de login
2. Digite:
   - **CNPJ:** `89.263.465/0001-49`
   - **Usuário:** `danilo`
   - **Senha:** `123456`
3. Clique em "Entrar"

### **2. Cadastrar Funcionário (Host)**
1. Faça login como host
2. Vá para **"Cadastro de Usuário"** no menu lateral
3. Clique no botão **"+"** para adicionar funcionário
4. Preencha:
   - **Nome:** Nome completo do funcionário
   - **Email:** Email do funcionário
5. Clique em **"Criar Funcionário"**
6. O sistema mostrará as credenciais de login:
   - **Usuário:** Nome do funcionário
   - **Senha:** `123456`

### **3. Login do Funcionário**
1. Acesse a tela de login
2. Digite:
   - **CNPJ:** Deixe em branco ou qualquer valor
   - **Usuário:** Nome exato do funcionário (como cadastrado)
   - **Senha:** `123456`
3. Clique em "Entrar"

## 🔐 Permissões por Tipo de Usuário

### **Host (danilo)**
- ✅ Home
- ✅ Cadastro de Obra
- ✅ Cadastro de Usuário (funcionários)
- ✅ Cadastro de Equipamento
- ✅ Cadastro de Estabelecimento
- ✅ Parâmetros
- ✅ Equipamentos Desaparecidos
- ✅ Relatórios

### **Funcionário**
- ✅ Home
- ❌ Cadastro de Obra
- ❌ Cadastro de Usuário
- ✅ Cadastro de Equipamento
- ❌ Cadastro de Estabelecimento
- ❌ Parâmetros
- ✅ Equipamentos Desaparecidos
- ✅ Relatórios

## 📋 Funcionalidades dos Funcionários

### **Cadastro de Equipamento**
- Funcionários podem cadastrar novas ferramentas
- Definir nome, modelo, serial, status
- Associar à obra ou estabelecimento atual

### **Transferência de Ferramentas**
- Mover ferramentas entre obras
- Mover ferramentas entre estabelecimentos
- Adicionar notas nas movimentações
- Histórico completo de transferências

### **Relatórios**
- Visualizar relatórios de movimentações
- Filtrar por período
- Exportar dados
- Acompanhar status das ferramentas

## 🧪 Funcionários de Teste

O sistema já vem com 2 funcionários de teste:

### **João Silva**
- **Usuário:** `João Silva`
- **Senha:** `123456`
- **Email:** `joao@empresa.com`

### **Maria Santos**
- **Usuário:** `Maria Santos`
- **Senha:** `123456`
- **Email:** `maria@empresa.com`

## 🔧 Como Testar

### **Teste 1: Login do Host**
1. Use as credenciais do host
2. Verifique se tem acesso a todas as páginas
3. Cadastre um novo funcionário

### **Teste 2: Login do Funcionário**
1. Use as credenciais de um funcionário
2. Verifique se só tem acesso às páginas permitidas
3. Teste cadastrar uma ferramenta
4. Teste transferir uma ferramenta

### **Teste 3: Fluxo Completo**
1. Host cadastra uma obra
2. Host cadastra um funcionário
3. Funcionário faz login
4. Funcionário cadastra uma ferramenta
5. Funcionário transfere a ferramenta para a obra
6. Host visualiza o relatório

## 🚨 Importante

- **Senha padrão:** Todos os funcionários usam senha `123456`
- **Usuário:** Deve ser o nome exato cadastrado pelo host
- **CNPJ:** Para funcionários, pode ser deixado em branco
- **Permissões:** Automáticas baseadas no tipo de usuário
- **Dados locais:** Sistema funciona sem Supabase para testes

## 📞 Suporte

Se houver problemas:
1. Verifique se está usando as credenciais corretas
2. Confirme se o funcionário foi cadastrado pelo host
3. Verifique se o nome do usuário está exato
4. Teste com os funcionários de exemplo primeiro
