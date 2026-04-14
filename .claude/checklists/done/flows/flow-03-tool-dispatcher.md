---
feature: flow-03-tool-dispatcher
status: active
created: 2026-04-09
---

# Flow Analysis: Fluxo 03 - Ferramentas LLM (ToolDispatcher)

## Descricao
Cobre os 6 tools chamaveis pelo LLM: `create_reminder`, `list_reminders`, `cancel_reminder`, `save_memory`, `search_memory`, `delete_memory`. Foca no dispatcher e nos servicos de dominio que cada tool aciona.

## Escopo
- **Entry**: `LLMProvider.chatWithTools()` retorna `toolCalls` com nome e args
- **Exit**: Tool executada, resultado retornado como string para `MessageService`
- **Modulos principais**:
  - `src/modules/tools/tool.dispatcher.ts`
  - `src/modules/reminders/reminder.service.ts`
  - `src/modules/reminders/reminder.repository.ts`
  - `src/modules/memory/memory.service.ts`
  - `src/modules/memory/memory.repository.ts`
  - `src/shared/crypto.ts`
  - `src/infra/db/index.ts`

## Tarefas

### 1. Analise
- [x] Executar `/flow` e selecionar "criacao de lembrete" (representa o padrao de todas as tools)
- [x] Mapear fluxo: `dispatch()` -> validacao de args -> servico -> repositorio -> resultado string
- [x] Analise critica para **cada** tool (repetir para as 6):
  - [x] `create_reminder`
  - [x] `list_reminders`
  - [x] `cancel_reminder`
  - [x] `save_memory`
  - [x] `search_memory`
  - [x] `delete_memory`

### 2. Correcoes
- [x] Corrigir bugs confirmados
- [x] Mitigar riscos identificados
- [x] Resolver inconsistencias de contrato entre dispatcher e servicos

### 3. Testes
- [x] Adicionar unhappy paths descobertos
- [x] `npm test` passando
- [x] `npm run test:coverage` passando

## Pontos de atencao (verificar na analise)
- `create_reminder`: validacao de data - o que acontece com ISO 8601 sem timezone? Com timezone errada?
- `cancel_reminder`: verifica `user_id` ao deletar? (garantir que usuario A nao cancela lembrete de B)
- `delete_memory`: idem - verifica `user_id` antes de deletar?
- `save_memory`: o que acontece com tag duplicada? Upsert ou erro?
- `search_memory`: busca por ILIKE na tag - e no conteudo? O conteudo e criptografado, nao pode ser buscado assim
- `list_reminders`: ordenacao? Limite de retorno?
- Criptografia: `save_memory` criptografa - `search_memory` decripta? Verificar fluxo completo encrypt->decrypt

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Unhappy paths cobertos para cada tool
- [x] Coverage acima dos thresholds (`npm run test:coverage`)
- [x] Limites de arquivo respeitados
- [x] `/review` aprovado

## Notas
- `create_reminder` agora exige ISO 8601 UTC com sufixo `Z` e responde em horario de Brasilia para evitar ambiguidade de timezone.
- `cancel_reminder` e `delete_memory` passaram a retornar erro quando nenhum registro do `user_id` e afetado, evitando falso positivo de sucesso.
- `save_memory` foi normalizado para upsert por `(user_id, tag)`; migration `005_memory_unique_tag_per_user.sql` remove duplicatas antigas e cria indice unico.
- `search_memory` continua buscando apenas em `tag`; o conteudo permanece criptografado em repouso e e apenas descriptografado na leitura.
