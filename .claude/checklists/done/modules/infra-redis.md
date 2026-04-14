---
feature: infra-redis
status: done
created: 2026-04-08
---

# Feature: infra/redis

## Descrição
Conexão Redis via ioredis com singleton de client e helpers de TTL (getJSON/setJSON). Base para os módulos `session` e `reminders`.

## Tarefas de Implementação

### `client.ts`
- [x] Criar `src/infra/redis/client.ts` com `buildClientConfig()` + `createClient()`
- [x] Validar vars obrigatórias: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` — erro claro se faltar

### `index.ts`
- [x] Criar `src/infra/redis/index.ts` com singleton + helpers:
  - `get(key)`, `set(key, value)`, `setex(key, ttl, value)`, `del(key)`
  - `getJSON<T>(key)`, `setJSON(key, value, ttlSeconds?)`, `close()`

### Testes
- [x] `__tests__/client.test.ts` — valida config gerada e erros por var ausente
- [x] `__tests__/redis.test.ts` — testa todos os helpers mockando ioredis

## Ciclo TDD por unidade

### client.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### index.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- Espelha o padrão de `infra/db` (pool.ts / index.ts)
- Convenção de chaves: `session:{remoteJid}` e `reminder:{userId}:{id}` — documentada, não imposta em código no MVP
- Nada sensível deve ser logado (senhas, conteúdo de sessão)
