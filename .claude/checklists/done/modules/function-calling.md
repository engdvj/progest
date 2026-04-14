---
feature: function-calling
status: done
created: 2026-04-08
---

# Feature: Function Calling / Tool Dispatch

## Descrição
Conecta o LLM às ações reais do sistema (lembretes, memória) via function calling (OpenAI-compatible).
O usuário fala em linguagem natural e o bot efetivamente agenda lembretes, salva notas e executa ações —
sem precisar saber nenhum comando.

## Tarefas de Implementação

### 1. Tipos e interface do LLM
- [x] Adicionar `ToolDefinition`, `ToolCall`, `LLMResponse` a `src/shared/types.ts`
- [x] Adicionar `chatWithTools(messages, tools)` à interface `ILLMProvider`

### 2. GroqProvider — implementar chatWithTools
- [x] Implementar `chatWithTools` em `src/providers/groq.provider.ts`
- [x] Testes: `src/providers/__tests__/groq.provider.test.ts`

### 3. ToolDispatcher — criar
- [x] Criar `src/modules/tools/tool.dispatcher.ts`
  - `getDefinitions()` — 6 tools: create_reminder, list_reminders, cancel_reminder, save_memory, search_memory, delete_memory
  - `dispatch(userId, remoteJid, toolCall)` — valida params + chama serviço correto
  - Validações: scheduled_at futuro, < 1 ano, formato ISO válido; tipos de todos os parâmetros
- [x] Criar `src/modules/tools/__tests__/tool.dispatcher.test.ts`

### 4. MessageService — orquestrar o fluxo de 2 passos
- [x] Modificar `src/modules/messages/message.service.ts`
  - Injetar `ToolDispatcher` (opcional, para não quebrar testes existentes)
  - System prompt passa a incluir data/hora atual
  - Se dispatcher presente: usa `chatWithTools` → se tool call → dispatch → send
  - Sem dispatcher: fluxo atual inalterado
- [x] Atualizar `src/modules/messages/__tests__/message.service.test.ts`

### 5. MessageHandler — injetar dependências
- [x] Modificar `src/modules/messages/message.handler.ts`
  - Instanciar `ToolDispatcher` com `ReminderService` + `MemoryService`
  - Passar ao `MessageService`

## Ciclo TDD por unidade

### GroqProvider.chatWithTools
- [x] Red: testes escritos e falhando
- [x] Green: implementação mínima passando
- [x] Refactor sem quebrar

### ToolDispatcher
- [x] Red: testes escritos e falhando
- [x] Green: implementação mínima passando
- [x] Refactor sem quebrar

### MessageService (fluxo com tools)
- [x] Red: testes escritos e falhando
- [x] Green: implementação mínima passando
- [x] Refactor sem quebrar

## Quality Gates
- [x] Todos os testes passando (`npm test`) — 215 testes, 24 arquivos
- [x] Unhappy paths cobertos (ao menos um por módulo — banco/dep. falha, input inválido)
- [x] Coverage acima dos thresholds (`npm run test:coverage`) — 96.61% stmt · 93.28% branch · 100% fn
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- `ReminderRepository`, `ReminderService`, `ReminderScheduler`, `MemoryRepository`, `MemoryService` — sem alteração
- `app.ts` — sem alteração
- Fluxo admin e endpoint `/webhook/evolution` — sem alteração
- Risco: prompt injection via parâmetros do tool call → mitigado por validação no dispatcher
- Risco: LLM retorna scheduled_at inválido → validar com `isNaN(new Date(...))` + futuro + < 1 ano
