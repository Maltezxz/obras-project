# 🚀 COMO FAZER DEPLOY NO BOLT - GUIA COMPLETO

## ✅ O QUE VOCÊ PRECISA SABER:

O seu app está **100% funcional** e pronto para uso. Ele já está conectado ao banco de dados do Bolt (Supabase) e todas as mudanças foram implementadas.

**VERSÃO ATUAL:** 2.1.0 (com sistema de cache busting automático)

---

## 📁 ARQUIVOS PARA DEPLOY

Todos os arquivos necessários estão na pasta `dist/`:

```
dist/
├── index.html              (Página principal)
├── assets/
│   ├── index-D0lnyGr6.js   (JavaScript do app - VERSÃO 2.1.0)
│   └── index-BKzjLEbs.css  (Estilos)
├── manifest.json           (PWA config)
├── sw.js                   (Service Worker)
├── _redirects              (Redirects para SPA)
└── icon-*.svg/png          (Ícones do app)
```

---

## 🌐 OPÇÕES DE DEPLOY

### **OPÇÃO 1: Deploy Direto no Bolt.new (RECOMENDADO)**

Se você está usando o Bolt.new, o deploy é **AUTOMÁTICO**:

1. **O Bolt.new já hospeda seu app automaticamente**
2. Acesse através da URL fornecida pelo Bolt
3. Se precisar fazer update:
   - Clique em "Deploy" ou "Publish" no Bolt.new
   - O Bolt vai usar automaticamente os arquivos da pasta `dist/`

**URL de Acesso:**
- Fornecida pelo Bolt.new no painel de controle

---

### **OPÇÃO 2: Deploy Manual (Netlify)**

Se você quiser hospedar em outro lugar:

#### **Passo 1: Fazer Deploy no Netlify**

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **"Add new site"** → **"Deploy manually"**
3. **Arraste a pasta `dist/`** inteira para a área de upload
4. Aguarde o deploy (30-60 segundos)
5. **Copie a URL** gerada (ex: `https://seu-app.netlify.app`)

#### **Passo 2: Configurar Variáveis de Ambiente no Netlify**

**IMPORTANTE:** O app precisa das variáveis de ambiente para conectar ao banco!

1. No painel do Netlify, vá em **Site settings** → **Environment variables**
2. Adicione estas variáveis:

```
VITE_SUPABASE_URL=https://vwjdqxscvbetzwgunnmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3amRxeHNjdmJldHp3Z3Vubm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjA2MzMsImV4cCI6MjA3NjEzNjYzM30.ROPafCWn7tkBysIm3IYp2BS76iqSfvxKNLbvP8ciEuk
VITE_DEFAULT_CNPJ=04.205.151/0001-37
```

3. Clique em **Save**
4. Faça um **novo deploy** (arraste a pasta `dist/` novamente)

---

### **OPÇÃO 3: Deploy Manual (Vercel)**

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **"Add New"** → **"Project"**
3. Arraste a pasta `dist/` para a área de upload
4. Adicione as mesmas variáveis de ambiente (igual Netlify)
5. Clique em **Deploy**

---

## 📱 COMO USAR EM DIFERENTES DISPOSITIVOS

### **Depois do Deploy:**

1. **No seu computador:**
   - Abra a URL do deploy
   - Clique no botão laranja **"Atualizar App"** na tela de login
   - Faça login normalmente
   - ✅ Deve aparecer 5 obras e 16 equipamentos

2. **No celular do Gutemberg:**
   - Abra a mesma URL
   - Clique no botão laranja **"Atualizar App"**
   - Faça login
   - ✅ Deve aparecer os mesmos dados

3. **Em qualquer outro dispositivo:**
   - Mesma URL
   - Clique em "Atualizar App" na primeira vez
   - ✅ Sincronizado!

---

## 🔧 SE OS DADOS NÃO APARECEREM

### **Problema: Cache do Navegador**

Se depois do deploy os dados ainda não aparecerem:

1. **Na tela de login**, clique no botão **LARANJA** "Atualizar App"
2. Isso vai:
   - Limpar localStorage
   - Limpar sessionStorage
   - Limpar todos os cookies
   - Recarregar a página

3. Depois faça login normalmente

### **Solução Alternativa (Manualmente):**

Se o botão não funcionar:

1. Abra o **Console do navegador** (F12)
2. Vá em **Application** → **Storage**
3. Clique em **Clear site data**
4. Recarregue a página (Ctrl+R ou Cmd+R)
5. Faça login

---

## 🎯 CONFIRMAÇÕES

### **Banco de Dados:**
✅ 2 hosts cadastrados
✅ 5 obras ativas
✅ 16 equipamentos
✅ 28 registros de histórico
✅ Supabase Cloud (Bolt Database)

### **App:**
✅ Versão 2.1.0
✅ Sistema de cache busting automático
✅ Botão manual de atualização
✅ PWA configurado para celular
✅ Todos os arquivos compilados

---

## 📞 SUPORTE

Se tiver problemas:

1. Verifique se a URL está correta
2. Clique no botão "Atualizar App" na tela de login
3. Limpe o cache do navegador manualmente
4. Verifique se está usando a mesma URL em todos os dispositivos

---

**IMPORTANTE:** Todos os dispositivos devem acessar a **MESMA URL** após o deploy. Se você acessar URLs diferentes (ex: localhost no computador e netlify.app no celular), vai ver dados diferentes!

✅ **Após o deploy, compartilhe a MESMA URL com todos os usuários!**
