# 🚀 Guia de Deploy - Prática Engenharia

## ✅ Build Pronto

O build está pronto na pasta `dist/` com todos os arquivos necessários.

## 📋 Passos para Deploy

### 1️⃣ Configure as Variáveis de Ambiente

**IMPORTANTE:** O servidor de deploy DEVE ter estas variáveis configuradas:

```bash
VITE_SUPABASE_URL=https://vwjdqxscvbetzwgunnmb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3amRxeHNjdmJldHp3Z3Vubm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjA2MzMsImV4cCI6MjA3NjEzNjYzM30.ROPafCWn7tkBysIm3IYp2BS76iqSfvxKNLbvP8ciEuk
VITE_DEFAULT_CNPJ=04.205.151/0001-37
```

**ATENÇÃO:**
- Se você usa **Netlify**, **Vercel** ou similar, configure estas variáveis no painel
- As variáveis devem começar com `VITE_` (é o padrão do Vite)
- Após configurar, faça um **novo build** no servidor

### 2️⃣ Faça Upload dos Arquivos

Faça upload de **TODOS** os arquivos da pasta `dist/`:

```
dist/
  ├── index.html          ← Arquivo principal
  ├── debug.html          ← Para debug (opcional)
  ├── manifest.json       ← PWA
  ├── sw.js              ← Service Worker
  ├── _redirects         ← Rotas SPA
  ├── icon.svg
  ├── icon-192.svg
  ├── icon-192.png
  ├── icon-512.svg
  └── assets/
      ├── index-*.js     ← JavaScript principal
      └── index-*.css    ← Estilos
```

### 3️⃣ Configuração do Servidor

#### Para Netlify:
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Para Vercel:
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Para Apache (.htaccess):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 🔍 Debug

### Se a página estiver em branco:

1. **Acesse `/debug.html`** no seu domínio
   - Exemplo: `https://seusite.com/debug.html`
   - Vai mostrar se o Supabase está acessível

2. **Abra o Console do navegador** (F12)
   - Procure por erros em vermelho
   - Procure pelos logs: `🚀 Prática Engenharia - Iniciando aplicação...`

3. **Verifique se aparece mensagem de erro:**
   - "Variáveis de ambiente não configuradas" → Configure as variáveis
   - "Erro ao inicializar" → Veja os detalhes no console
   - Tela totalmente branca → Problema de caminho dos arquivos

### Erros Comuns:

#### ❌ "Variáveis de ambiente não configuradas"
**Solução:** Configure as variáveis no painel do serviço de hospedagem e faça rebuild

#### ❌ 404 em `/assets/index-*.js`
**Solução:** Verifique se todos os arquivos da pasta `assets/` foram enviados

#### ❌ Página branca sem erros no console
**Solução:** Verifique o redirecionamento SPA (veja seção 3️⃣)

#### ❌ "Failed to fetch" ou erro de CORS
**Solução:** Verifique se o domínio está em HTTPS (o Supabase exige HTTPS)

## 📱 PWA (Progressive Web App)

A aplicação está configurada como PWA! Após o primeiro acesso:
- Funciona offline
- Pode ser instalada no celular
- Aparece como app nativo

## ✅ Checklist Final

- [ ] Variáveis de ambiente configuradas
- [ ] Todos os arquivos da pasta `dist/` enviados
- [ ] Redirecionamento SPA configurado
- [ ] Site em HTTPS
- [ ] `/debug.html` mostra tudo ✓ verde
- [ ] Console não mostra erros
- [ ] Login funciona
- [ ] Dados aparecem corretamente

## 🆘 Ainda não funciona?

Se seguiu todos os passos e ainda está em branco:

1. Acesse `/debug.html` e tire print
2. Abra F12 → Console e tire print
3. Abra F12 → Network e recarregue a página, tire print
4. Me envie esses 3 prints para análise

---

**Build gerado em:** 03/11/2025
**Versão:** 1.0.0
