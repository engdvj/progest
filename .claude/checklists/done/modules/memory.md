---
feature: memory
status: done
created: 2026-04-08
---

# Feature: Memória Persistente por Usuário

## Descrição
Permite que o bot salve, busque e esqueça informações fornecidas pelo usuário durante a conversa.
Conteúdo armazenado é criptografado em repouso (AES-256-GCM). Cada registro é identificado por uma tag livre.

## Estrutura aprovada

```
src/
├── infra/db/migrations/002_memory.sql
└── modules/memory/
    ├── memory.repository.ts         (IMemoryRepository + MemoryRepository)
    ├── memory.service.ts            (MemoryService)
    └── __tests__/
        ├── memory.repository.test.ts
        └── memory.service.test.ts
```

## Tarefas de Implementação

### Migration
- [x] Criar `002_memory.sql` (tabela memories: id, user_id FK, tag, content, created_at)

### memory.repository.ts
- [x] Definir tipo `Memory` e `CreateMemoryData`
- [x] Definir interface `IMemoryRepository` (save, findAll, findByTag, delete)
- [x] Implementar `MemoryRepository` — criptografa em save, descriptografa no read

### memory.repository.test.ts
- [x] Teste: save + findAll retorna registro descriptografado
- [x] Teste: findByTag filtra por tag corretamente
- [x] Teste: delete remove o registro
- [x] Teste: criptografia real — conteúdo no banco é diferente do plaintext

### memory.service.ts
- [x] `save(userId, tag, content)` — delega ao repo
- [x] `listAll(userId)` — retorna todos os registros do usuário
- [x] `search(userId, query)` — busca por tag ou conteúdo parcial
- [x] `forget(userId, tag)` — remove por tag

### memory.service.test.ts
- [x] Teste: save chama repo.save com argumentos corretos
- [x] Teste: listAll retorna registros do repo
- [x] Teste: search filtra corretamente
- [x] Teste: forget chama repo.delete

## Ciclo TDD por unidade

### memory.repository.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### memory.service.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- Conteúdo criptografado com `encrypt()`/`decrypt()` de `shared/crypto.ts`
- Chave via `process.env.ENCRYPTION_KEY`
- Tag é texto livre — não é enum, usuário define via linguagem natural
- `findByTag` e `search` sempre filtram por `user_id` (isolamento garantido)
