---
feature: flow-04-reminder-scheduler
status: active
created: 2026-04-09
---

# Flow Analysis: Fluxo 04 - Disparar Lembretes (cron)

## Descrição
Scheduler que roda a cada minuto, busca lembretes pendentes no banco e os envia via Evolution API, marcando-os como disparados.

## Escopo
- **Entry**: `node-cron` dispara `ReminderScheduler.tick()` a cada minuto
- **Exit**: Lembretes enviados ao usuário no WhatsApp + `fired_at` gravado no banco
- **Módulos principais**:
  - `src/modules/reminders/reminder.scheduler.ts`
  - `src/modules/reminders/reminder.repository.ts`
  - `src/modules/messages/evolution.client.ts`

## Tarefas

### 1. Análise
- [ ] Executar `/flow` e selecionar "criação de lembrete" + scheduler
- [x] Mapear fluxo: cron -> `findPending()` -> loop -> `sendText()` -> `markFired()`
- [x] Análise crítica por passo

### 2. Correções
- [x] Corrigir bugs confirmados
- [x] Mitigar riscos identificados
- [x] Resolver inconsistências

### 3. Testes
- [x] Adicionar unhappy paths descobertos
- [x] `npm test` passando
- [x] `npm run test:coverage` passando

## Pontos de atenção (verificar na análise)
- O que acontece se `sendText` falhar para um lembrete específico? Os demais são processados? O lembrete é re-tentado?
- `markFired` é chamado antes ou depois de `sendText`? Se `sendText` falhar após `markFired`, o lembrete é perdido
- Lembrete atrasado (servidor ficou offline por 10 min): todos os lembretes do período são disparados de uma vez?
- Concorrência: se o tick anterior ainda estiver rodando quando o próximo dispara, pode haver duplo envio?
- `remoteJid` nos lembretes: está usando o JID canônico ou pode ter JID antigo se o usuário mudou de número?
- Lembretes de usuários inativos/deletados: são enviados mesmo assim?

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Unhappy paths cobertos
- [x] Coverage acima dos thresholds (`npm run test:coverage`)
- [x] Limites de arquivo respeitados
- [x] `/review` aprovado

## Notas
<!-- Observações durante análise -->
- `markFired()` continua sendo chamado apenas depois de `sendText()`. Se o envio falhar, o lembrete não é marcado e volta a ser tentado no próximo tick.
- `findPending()` agora faz `JOIN users` e filtra `u.ativo = TRUE`, evitando envio para usuários inativos e usando o `users.remote_jid` atual em vez do snapshot salvo no lembrete.
- O scheduler agora usa `pg_try_advisory_lock()` por tick. Se um tick anterior ainda estiver rodando, o seguinte é ignorado e não ocorre processamento concorrente.
- Lembretes atrasados continuam sendo disparados no próximo tick em lote, porque a busca permanece por `scheduled_at <= NOW()` e `fired_at IS NULL`.
- Testes adicionados para lock indisponível e liberação do lock quando `findPending()` falha.
