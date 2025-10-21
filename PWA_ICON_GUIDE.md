# Guia de Ícones PWA - Prática Engenharia

## ✅ Ícone da Logo Prática Implementado

O ícone PWA agora usa a identidade visual da **Prática Engenharia** com os triângulos característicos da marca.

## 🎨 Design do Ícone

### Elementos Visuais
- **Triângulos**: Reproduz a logo original da Prática
  - Triângulo superior: Laranja (#F39C12)
  - Triângulo inferior esquerdo: Azul claro (#5DADE2)
  - Triângulo inferior centro: Azul escuro (#0F4C75)
  - Triângulo inferior direito: Azul médio (#5499C7)

- **Letra "P"**: Representa "Prática"
  - Cor: Branco
  - Posição: Parte inferior do ícone
  - Font: Bold, 90px

- **Fundo**: Azul escuro da Prática (#1A5276)
- **Bordas arredondadas**: 110px (padrão iOS/Android)

## 📦 Arquivos Gerados

```
public/
  ├── icon.svg         ← Ícone principal (escalável)
  ├── icon-192.svg     ← Ícone 192x192px
  └── icon-512.svg     ← Ícone 512x512px
```

### Tamanhos e Formatos

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `icon.svg` | Escalável | Favicon, ícone genérico |
| `icon-192.svg` | 192x192px | Android, iOS (tela inicial) |
| `icon-512.svg` | 512x512px | Android (splash screen) |

## 📱 Onde o Ícone Aparece

### Android
- ✅ Tela inicial (ao adicionar à tela)
- ✅ Drawer de aplicativos
- ✅ Recentes/Multitarefa
- ✅ Splash screen (tela de carregamento)
- ✅ Notificações (se implementadas)

### iOS (Safari)
- ✅ Tela inicial
- ✅ Multitarefa
- ✅ Spotlight (busca)
- ✅ Configurações → Safari → Apps da Tela Inicial

### Desktop
- ✅ Aba do navegador (favicon)
- ✅ Barra de favoritos
- ✅ Atalho na área de trabalho (Chrome/Edge)
- ✅ Menu Iniciar (Windows PWA)
- ✅ Dock (macOS PWA)

## 🎯 Configurações Técnicas

### manifest.json
```json
{
  "background_color": "#1A5276",  // Azul Prática
  "theme_color": "#1A5276",       // Azul Prática
  "icons": [
    // 3 variações: any, 192, 512
    // 2 purposes: any, maskable
  ]
}
```

### index.html
```html
<meta name="theme-color" content="#1A5276">
<link rel="icon" type="image/svg+xml" href="/icon.svg">
<link rel="apple-touch-icon" href="/icon-192.svg">
```

### Service Worker (sw.js)
```javascript
const CACHE_NAME = 'pratica-eng-v3';
const urlsToCache = [
  '/icon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];
```

## ✨ Características PWA

### Purpose: "any"
- Ícone padrão sem alterações
- Usado na maioria dos contextos
- Mantém proporções originais

### Purpose: "maskable"
- Ícone preparado para máscaras adaptativas
- Android 8.0+ (adaptive icons)
- Área segura de 80% (safe zone)
- Permite backgrounds personalizados do sistema

## 🔧 Personalização

### Como Alterar o Ícone

1. **Editar SVG**:
   ```bash
   # Abra o arquivo
   code public/icon.svg

   # Modifique cores, formas, texto
   # Mantenha viewBox="0 0 512 512"
   ```

2. **Atualizar Service Worker**:
   ```javascript
   // Incremente a versão
   const CACHE_NAME = 'pratica-eng-v4';
   ```

3. **Rebuild**:
   ```bash
   npm run build
   ```

### Cores da Marca Prática

```css
Azul Principal:  #1A5276
Azul Claro:      #5DADE2
Azul Médio:      #5499C7
Azul Escuro:     #0F4C75
Laranja:         #F39C12
Amarelo:         #F4D03F (ENGENHARIA)
```

## 📐 Especificações iOS

### Apple Touch Icon
- Tamanho: 180x180px (recomendado)
- Formato: SVG ou PNG
- Bordas: Arredondadas automaticamente pelo iOS
- Sem transparência: iOS adiciona fundo se necessário

### Status Bar
```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```
- Barra translúcida com cor do tema

## 📐 Especificações Android

### Adaptive Icon
- Safe Zone: 80% do ícone visível sempre
- Maskable: Permite cortes personalizados
- Background: Preenchido pelo sistema se necessário

### Shortcuts (Atalhos)
```json
// Adicionar ao manifest.json (futuro)
"shortcuts": [
  {
    "name": "Nova Ferramenta",
    "url": "/ferramentas?action=new",
    "icons": [{ "src": "/icon-192.svg", "sizes": "192x192" }]
  }
]
```

## 🎨 Design System

### Proporções
- Logo (triângulos): 280x160px (centralizado)
- Letra P: 90px de altura
- Margem superior: 120px
- Margem inferior: 112px

### Espaçamento Safe Zone
```
┌─────────────────────┐
│ 10%  ← Margem       │
│   ┌─────────────┐   │
│   │             │   │ ← 80% área segura
│   │   ÍCONE     │   │    (sempre visível)
│   │             │   │
│   └─────────────┘   │
│       Margem → 10%  │
└─────────────────────┘
```

## 🚀 Performance

### Tamanhos dos Arquivos
```
icon.svg:      ~1.2 KB  (gzipped: ~600 bytes)
icon-192.svg:  ~1.2 KB  (gzipped: ~600 bytes)
icon-512.svg:  ~1.2 KB  (gzipped: ~600 bytes)
```

### Otimizações
- ✅ SVG inline (sem imagens externas)
- ✅ Formas vetoriais (escala perfeita)
- ✅ Sem gradientes complexos
- ✅ Cores sólidas (melhor compressão)
- ✅ Cache pelo Service Worker

## 📱 Como Testar

### Localmente
1. Build: `npm run build`
2. Serve: `npx serve -s dist`
3. Abra em: `http://localhost:3000`

### No Celular (mesma rede)
1. Descubra IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
2. Acesse: `http://192.168.x.x:3000`
3. Adicione à tela inicial

### Lighthouse (Chrome DevTools)
```bash
1. F12 → Lighthouse
2. Categories: PWA
3. Analyze page load
4. Verifique: "User can install the PWA"
```

## 🐛 Troubleshooting

### Ícone não aparece (Android)
- Limpe dados do Chrome
- Desinstale o PWA e reinstale
- Verifique manifest.json (sem erros JSON)

### Ícone não aparece (iOS)
- Use Safari (não Chrome)
- Certifique-se que está em HTTPS
- Recarregue com Cmd+R
- Adicione novamente à tela inicial

### Ícone antigo ainda aparece
- Incremente versão do Service Worker
- Desregistre o SW (DevTools → Application)
- Clear cache e hard reload (Cmd+Shift+R)

## ✅ Checklist de Implementação

- [x] Criar icon.svg com logo Prática
- [x] Criar icon-192.svg (192x192)
- [x] Criar icon-512.svg (512x512)
- [x] Atualizar manifest.json
- [x] Atualizar index.html
- [x] Atualizar service worker (v3)
- [x] Configurar theme-color
- [x] Build e deploy
- [x] Testar em Android
- [x] Testar em iOS

---

**🎨 Design baseado na identidade visual da Prática Engenharia**
**📱 Otimizado para todas as plataformas (Android, iOS, Desktop)**
