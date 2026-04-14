---
feature: infra/db
status: active
created: 2026-04-07
---

# Feature: infra/db — Conexão PostgreSQL + pool + migrations base

## Descrição
Camada base de acesso ao PostgreSQL. Fornece `query()`, `getClient()` e `closePool()` para todos os módulos de serviço. Roda as migrations na inicialização do servidor.

## Tarefas de Implementação

- [x] `pool.ts` — criar Pool com env vars; falhar explicitamente se variáveis ausentes
- [x] `index.ts` — exportar `query()`, `getClient()`, `closePool()`
- [x] `migrate.ts` — runner que lê arquivos `.sql` em ordem e executa
- [x] `migrations/001_initial.sql` — tabela `users` base
- [x] `server.ts` — chamar `migrate()` no startup antes do `app.listen()`

## Ciclo TDD por unidade

### pool.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### index.ts — query() e getClient()
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### migrate.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

## Quality Gates
- [x] Todos os testes passando (`cd botzap/backend && npm test`)
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/security` Modo 2 sem severidade alta
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- `query()` aceita apenas `(text, params[])` — nunca interpolação de string
- Pool lido de env vars; `DB_POOL_MAX` configurável
- Erros do pg fazem wrap antes de propagar (não expõem internals)
- esbuild moderate (via vitest devDep) — aceito; dev-only, sem exposição em prod; revisar ao atualizar vitest
- Fastify atualizado de v4 → v5.8.4 para corrigir high severity
