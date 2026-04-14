---
feature: messages
status: done
created: 2026-04-08
---

# Feature: messages

## Descrição
Coração do MVP: recebe webhook da Evolution API, autentica usuário, orquestra sessão + LLM e envia resposta via Evolution. Primeiro módulo a integrar todos os anteriores.

## Tarefas de Implementação

### `evolution.client.ts`
- [x] Implementar `EvolutionClient` com `sendText(remoteJid, text)`
- [x] Validar `EVOLUTION_SERVER_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` no construtor
- [x] POST com header `apikey` e timeout 10s

### `message.service.ts`
- [x] Implementar `MessageService` recebendo dependências por injeção
- [x] `handle(remoteJid, text)`: assertWhitelisted → addMessage(user) → getHistory → llm.chat → addMessage(assistant) → sendText
- [x] Definir `SYSTEM_PROMPT` como constante nomeada

### `message.handler.ts`
- [x] Implementar handler Fastify para `POST /webhook/evolution`
- [x] Validar header `apikey` contra `EVOLUTION_API_KEY` → 401 se inválido
- [x] Filtrar: só processar `messages.upsert`, `fromMe=false`, body não vazio
- [x] Sempre responder 200 após processar (Evolution não deve receber erros)
- [x] `AppError` e erros inesperados: logar + retornar 200 silenciosamente

### Registro no `app.ts`
- [x] Registrar a rota `POST /webhook/evolution` no `app.ts`

### Testes
- [x] `__tests__/evolution.client.test.ts` — mock axios, testa sendText e erros
- [x] `__tests__/message.service.test.ts` — mock todas as deps, testa fluxo completo
- [x] `__tests__/message.handler.test.ts` — mock service, testa filtragem e respostas HTTP

## Ciclo TDD por unidade

### evolution.client.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### message.service.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### message.handler.ts + app.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- Handler sempre retorna 200 — Evolution API não deve receber erros HTTP
- NotFoundError/UnauthorizedError do assertWhitelisted são silenciados (usuário fora da whitelist não recebe resposta)
- fromMe=false obrigatório — bot não responde a si mesmo
- System prompt separa instrução de conteúdo do usuário (mitigação prompt injection)
- EVOLUTION_API_KEY validada no header do webhook como guard de spoofing
