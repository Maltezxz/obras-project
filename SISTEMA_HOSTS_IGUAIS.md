# Sistema de Hosts com Visualização Igual

## Conceito Principal

**TODOS os hosts do mesmo CNPJ veem EXATAMENTE a mesma coisa em todas as abas do sistema.**

A única diferença entre hosts é a proteção: Fernando Antunes é protegido e não pode ser removido por outros hosts.

## Como Funciona

### Para HOSTS (Fernando Antunes, Gutemberg, etc.)

Quando um host faz login, o sistema:

1. **Busca todos os hosts do mesmo CNPJ**
   ```sql
   SELECT id FROM users
   WHERE role = 'host'
   AND cnpj = '04.205.151/0001-37';
   ```

   Retorna: `['fernando_id', 'gutemberg_id']`

2. **Busca TODOS os dados desses hosts**
   ```sql
   SELECT * FROM ferramentas
   WHERE owner_id IN ('fernando_id', 'gutemberg_id');

   SELECT * FROM obras
   WHERE owner_id IN ('fernando_id', 'gutemberg_id');
   ```

3. **Mostra tudo sem filtrar**
   - Ferramentas: 16 total (2 do Fernando + 14 do Gutemberg)
   - Obras: 5 total
   - Histórico: 28 registros
   - Usuários: Todos os funcionários cadastrados

### Para FUNCIONÁRIOS

Funcionários veem APENAS o que foi permitido através das tabelas de permissões:
- `user_obra_permissions` - Obras permitidas
- `user_ferramenta_permissions` - Ferramentas permitidas

## Abas do Sistema

### 1. Home (HomePage.tsx)
**Fernando Antunes vê:**
- 16 equipamentos totais
- 5 obras ativas
- 28 atividades recentes
- Estatísticas completas

**Gutemberg vê:**
- 16 equipamentos totais (IGUAL ao Fernando)
- 5 obras ativas (IGUAL ao Fernando)
- 28 atividades recentes (IGUAL ao Fernando)
- Estatísticas completas (IGUAL ao Fernando)

### 2. Equipamentos (FerramentasPage.tsx)
Todos os hosts veem as 16 ferramentas:
- 2 ferramentas cadastradas por Fernando
- 14 ferramentas cadastradas por Gutemberg
- Total: 16 ferramentas visíveis para AMBOS

### 3. Obras (ObrasPage.tsx)
Todos os hosts veem as 5 obras:
- Obras criadas por Fernando
- Obras criadas por Gutemberg
- Total: 5 obras visíveis para AMBOS

### 4. Usuários (UsuariosPage.tsx)
Todos os hosts veem:
- Fernando Antunes (HOST - PROTEGIDO ⚠️)
- Gutemberg (HOST)
- joao (FUNCIONÁRIO)
- Guilherme (FUNCIONÁRIO)

**Diferença importante:**
- Fernando pode remover Gutemberg ✅
- Gutemberg NÃO pode remover Fernando ❌ (protegido)

### 5. Histórico (HistoricoPage.tsx)
Todos os hosts veem:
- 28 registros de atividades
- Movimentações de todas as ferramentas
- Alterações em todas as obras

### 6. Desaparecidos (DesaparecidosPage.tsx)
Todos os hosts veem:
- Todas as ferramentas marcadas como desaparecidas
- Independente de quem cadastrou

### 7. Parâmetros (ParametrosPage.tsx)
Todos os hosts podem:
- Gerenciar permissões de obras para funcionários
- Gerenciar permissões de ferramentas para funcionários
- Ver e editar permissões de qualquer funcionário

## Implementação Técnica

### Código Padrão para HOSTS

```typescript
// Para HOSTS: buscar TODOS os hosts do mesmo CNPJ
if (user.role === 'host') {
  const { data: hosts } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'host')
    .eq('cnpj', user.cnpj);

  ownerIds = hosts?.map(h => h.id) || [user.id];

  // Buscar dados de TODOS os hosts
  const { data } = await supabase
    .from('ferramentas')
    .select('*')
    .in('owner_id', ownerIds);

  // MOSTRAR TUDO sem filtrar
  setFerramentas(data);
}
```

### Código Padrão para FUNCIONÁRIOS

```typescript
// Para FUNCIONÁRIOS: filtrar por permissões
if (user.role === 'funcionario') {
  const { data } = await supabase
    .from('ferramentas')
    .select('*')
    .in('owner_id', [user.host_id]);

  // FILTRAR por permissões
  const filtered = await getFilteredFerramentas(
    user.id,
    user.role,
    user.host_id,
    data
  );

  setFerramentas(filtered);
}
```

## Proteção do Host Principal

Fernando Antunes é protegido através de:

```typescript
// Em constants/auth.ts
export const PROTECTED_HOST = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Fernando Antunes'
};

// Verificação ao deletar
if (employeeId === PROTECTED_HOST.id) {
  throw new Error(`${PROTECTED_HOST.name} não pode ser removido.`);
}
```

## Resumo Visual

```
CNPJ: 04.205.151/0001-37
│
├── 🔑 Fernando Antunes (HOST - PROTEGIDO)
│   └── Vê: 16 ferramentas, 5 obras, 28 históricos
│
├── 🔑 Gutemberg (HOST)
│   └── Vê: 16 ferramentas, 5 obras, 28 históricos (IGUAL ao Fernando)
│
├── 👤 joao (FUNCIONÁRIO)
│   └── Vê: 2 ferramentas, 2 obras (apenas permitidas)
│
└── 👤 Guilherme (FUNCIONÁRIO)
    └── Vê: 0 ferramentas, 0 obras (sem permissões)
```

## Status Atual

✅ Todos os hosts do mesmo CNPJ veem os mesmos dados
✅ Fernando Antunes é protegido contra remoção
✅ Funcionários veem apenas o permitido
✅ Sistema funcionando 100%
✅ Build concluído com sucesso
