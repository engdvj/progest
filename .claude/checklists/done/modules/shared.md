---
feature: shared
status: done
created: 2026-04-08
---

# Feature: shared

## Descrição
Fundação compartilhada: ENUMs e tipos globais, hierarquia de erros e utilitário de criptografia AES-256-GCM. Usada por todos os módulos de domínio.

## Tarefas de Implementação

### `types.ts`
- [x] Criar `src/shared/types.ts` com ENUMs e tipos globais:
  - `UserLevel`: `'usuario' | 'admin' | 'superadmin'`
  - `UserProfile`: `'tecnico' | 'analista' | 'coordenador'`
  - `ChatMessage`: `{ role: 'user' | 'assistant' | 'system'; content: string }`

### `errors.ts`
- [x] Criar `src/shared/errors.ts` com hierarquia de erros:
  - `AppError` (base — `message` + `statusCode`)
  - `NotFoundError` extends AppError (404)
  - `UnauthorizedError` extends AppError (401)
  - `ValidationError` extends AppError (400)

### `crypto.ts`
- [x] Criar `src/shared/crypto.ts` com AES-256-GCM:
  - `encrypt(plaintext, keyHex): string` → formato `iv:authTag:ciphertext`
  - `decrypt(encoded, keyHex): string` → lança se authTag falhar
  - Validar tamanho da chave (64 hex chars = 32 bytes)

### Testes
- [x] `__tests__/errors.test.ts` — testa statusCode, mensagem e instanceof de cada subclasse
- [x] `__tests__/crypto.test.ts` — testa encrypt/decrypt, integridade (authTag), chave inválida

## Ciclo TDD por unidade

### errors.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### crypto.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- `types.ts` não tem testes — tipos são compile-time, sem comportamento em runtime
- AES-256-GCM obrigatório (não CBC) — fornece autenticação de integridade via authTag
- IV aleatório por operação via `crypto.randomBytes(12)` (96 bits, padrão GCM)
- Chave vem de `ENCRYPTION_KEY` do `.env` — nunca hardcoded, nunca logada
