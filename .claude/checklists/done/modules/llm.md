---
feature: llm
status: done
created: 2026-04-08
---

# Feature: llm

## Descrição
Interface ILLMProvider (Strategy) + GroqProvider (MVP) + factory createLLMProvider(). O módulo messages nunca chama o LLM diretamente — sempre via provider.

## Tarefas de Implementação

### `llm.provider.ts`
- [x] Definir interface `ILLMProvider` com `chat(messages: ChatMessage[]): Promise<string>`
- [x] Implementar `createLLMProvider()` — factory que lê `LLM_PROVIDER` do env e retorna a implementação correta
- [x] Lançar `ValidationError` para providers não suportados

### `groq.provider.ts`
- [x] Implementar `GroqProvider implements ILLMProvider`
- [x] Validar `GROQ_API_KEY` e `GROQ_MODEL` no construtor
- [x] POST para Groq API com timeout de 30s via axios
- [x] Lançar `AppError` em falha de rede, resposta inválida ou rate limit (429)

### Testes
- [x] `__tests__/llm.provider.test.ts` — testa factory: groq retorna instância, unknown lança ValidationError
- [x] `__tests__/groq.provider.test.ts` — mock axios, testa chat e tratamento de erros

## Ciclo TDD por unidade

### llm.provider.ts (factory)
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### groq.provider.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- GROQ_API_KEY nunca logada — nem parcialmente
- Timeout 30s obrigatório — chamadas LLM podem travar
- Prompt injection: provider apenas repassa mensagens; mitigação é responsabilidade do módulo messages (system prompt)
- OllamaProvider e OpenRouterProvider são Fase 3 — factory lança ValidationError até lá
- Groq usa endpoint compatível com OpenAI: POST /openai/v1/chat/completions
