---
feature: flow-01-mensagem-recebida
status: done
created: 2026-04-09
---

# Flow Analysis: Fluxo 01 — Mensagem Recebida (chat principal)

## Descrição
Fluxo principal: do webhook da Evolution API até o envio da resposta ao usuário. Inclui autenticação, whitelist, sessão Redis, LLM com tools e envio.

## Escopo
- **Entry**: `POST /webhook/evolution`
- **Exit**: Resposta enviada ao usuário + sessão atualizada no Redis
- **Módulos**: `message.handler.ts`, `message.service.ts`, `user.repository.ts`, `session.service.ts`, `llm.provider.ts`, `groq.provider.ts`, `tool.dispatcher.ts`, `evolution.client.ts`

## Bugs corrigidos
- [x] Webhook sem autenticação por `apikey` — `message.handler.ts`
- [x] Resposta salva no histórico antes de confirmar envio bem-sucedido — `message.service.ts`

## Riscos mitigados
- [x] Race condition em `addMessage` (GET+SET não atômico) — mutex por JID em `session.service.ts`
- [x] Exceção em `admin.tryHandle` silenciava erro para o admin — try/catch em `message.service.ts`
- [x] Múltiplos tool calls da Groq ignorados silenciosamente — loop em `message.service.ts`, `groq.provider.ts`

## Inconsistências resolvidas
- [x] Tool call não registrada no formato de protocolo OpenAI — `message.service.ts`, `shared/types.ts`
- [x] Retry do 9º dígito não atualizava JID canônico no banco — `evolution.client.ts`, `user.repository.ts`, `user.service.ts`
- [x] Resumo de compressão usava `role:'assistant'` em vez de `'system'` — `message.service.ts`, `session.scheduler.ts`

## Quality Gates
- [x] 218 testes passando (`npm test`)
- [x] Unhappy paths cobertos
- [x] Limites de arquivo respeitados (hook corrigido para `*.test.ts`: 350 linhas)
- [x] `CLAUDE.md` atualizado com limite de `*.test.ts`

## Notas
- `ChatMessage`, `ToolCall`, `LLMResponse` atualizados em `shared/types.ts`
- `message.service.test.ts` dividido em dois arquivos para respeitar o limite de linhas
- Fluxo 12 (compressão de histórico) foi coberto nesta análise
