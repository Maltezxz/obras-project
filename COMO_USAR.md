# Como Usar o Sistema Após a Migração

## Primeira Execução

1. **Iniciar o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

2. **Acessar o sistema**:
   - Abra o navegador em `http://localhost:5173`

3. **Fazer login com o usuário padrão**:
   - **CNPJ**: 12345678000190
   - **Nome de Usuário**: Fernando Antunes
   - **Senha**: senha123

## Dados do Sistema

### Armazenamento
- Todos os dados são armazenados no **localStorage** do navegador
- Para ver os dados: Abra o DevTools → Application → Local Storage → localhost
- Procure pela chave: `obrasflow_database`

### Backup dos Dados

Para fazer backup dos seus dados:

1. Abra o Console do navegador (F12)
2. Execute:
   ```javascript
   const backup = localStorage.getItem('obrasflow_database');
   console.log(backup);
   ```
3. Copie o resultado e salve em um arquivo `.txt`

Para restaurar:
```javascript
localStorage.setItem('obrasflow_database', 'SEU_BACKUP_AQUI');
location.reload();
```

### Limpar Dados

Para limpar todos os dados e começar do zero:
```javascript
localStorage.removeItem('obrasflow_database');
localStorage.removeItem('obrasflow_user_id');
location.reload();
```

## Funcionalidades Disponíveis

### Sistema Funcionando
- ✅ Login e autenticação
- ✅ Cadastro de usuários
- ✅ Gerenciamento de obras
- ✅ Gerenciamento de ferramentas
- ✅ Sistema de permissões
- ✅ HomePage com dashboard

### Páginas Compat (Usando Stub Temporário)
As seguintes páginas ainda usam o stub de compatibilidade e precisam ser completamente migradas:
- ObrasPage
- FerramentasPage
- DesaparecidosPage
- HistoricoPage
- ParametrosPage
- RelatoriosPage

Essas páginas compilam e abrem, mas as funcionalidades que dependem do banco de dados podem não funcionar corretamente até serem migradas.

## Diferenças do Supabase

### Antes (Supabase)
```typescript
const { data, error } = await supabase
  .from('obras')
  .select('*')
  .in('owner_id', ownerIds);

if (error) throw error;
const obras = data;
```

### Agora (Banco Local)
```typescript
const obras = await dbHelpers.getObrasByOwnerIds(ownerIds);
```

## Limitações

1. **Dados por Navegador**: Cada navegador tem seu próprio banco de dados
2. **Sem Sincronização**: Dados não são sincronizados entre dispositivos
3. **Limite de Armazenamento**: localStorage tem limite de ~10MB
4. **Sem Realtime**: Não há atualizações em tempo real entre abas/dispositivos

## Próximas Melhorias Recomendadas

1. **Sistema de Export/Import**: Criar funcionalidade para exportar e importar dados em JSON/CSV
2. **Migração Completa**: Finalizar a migração das páginas que ainda usam o stub
3. **Validações**: Adicionar mais validações de dados antes de salvar
4. **Imagens**: Implementar storage local para imagens (usando base64 ou File API)
5. **Performance**: Adicionar cache em memória para queries frequentes

## Solução de Problemas

### "Não consigo fazer login"
- Verifique se o banco foi inicializado
- Limpe o localStorage e recarregue a página
- Tente com as credenciais padrão listadas acima

### "Os dados não estão salvando"
- Verifique o Console do navegador para erros
- Confirme que o localStorage não está cheio
- Teste em modo anônimo para descartar extensões

### "Página em branco após login"
- Abra o Console do navegador para ver erros
- Verifique se há erros de JavaScript
- Tente limpar o cache do navegador

## Desenvolvimento

Para adicionar novas funcionalidades:

1. Use as funções em `src/lib/db-helpers.ts`
2. Para queries personalizadas, use `query()` de `src/lib/database.ts`
3. Sempre chame `saveDatabase()` após modificações
4. Teste em ambiente local antes de fazer deploy

## Deploy

O sistema pode ser deployado em qualquer serviço de hosting estático:
- Netlify
- Vercel
- GitHub Pages
- Etc.

Apenas execute:
```bash
npm run build
```

E faça upload da pasta `dist/` para o serviço escolhido.
