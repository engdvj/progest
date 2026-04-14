---
feature: session
status: done
created: 2026-04-08
---

# Feature: session

## Descrição
Histórico de conversa por usuário armazenado no Redis com TTL configurável. Base para o contexto que o LLM recebe a cada mensagem.

## Tarefas de Implementação

### `session.service.ts`
- [x] Implementar `SessionService` com TTL e maxMessages injetados no construtor (defaults do env)
- [x] `getHistory(remoteJid)` — retorna `ChatMessage[]`, `[]` se sessão não existe
- [x] `addMessage(remoteJid, message)` — append + trim para `maxMessages` + setJSON com TTL
- [x] `clearSession(remoteJid)` — del da chave Redis

### Testes
- [x] `__tests__/session.service.test.ts` — mock `@infra/redis/index.js`, testa os três métodos

## Ciclo TDD

### session.service.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- Chave Redis: `session:{remoteJid}` — isolamento por usuário obrigatório
- TTL é resetado a cada `addMessage` — sessões ativas ficam vivas
- `SESSION_TTL` inválido ou 0 usa default 7200; `SESSION_MAX_MESSAGES` usa default 20
- Conteúdo não criptografado — aceitável no MVP (Redis interno, TTL curto)
