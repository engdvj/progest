---
feature: reminders
status: done
created: 2026-04-08
---

# Feature: Lembretes com Agendamento

## Descrição
Permite que o bot agende lembretes para o usuário. Um job cron verifica a cada minuto os lembretes pendentes e dispara via Evolution API.

## Estrutura aprovada

```
src/
├── infra/db/migrations/003_reminders.sql
└── modules/reminders/
    ├── reminder.repository.ts    (IReminderRepository + ReminderRepository)
    ├── reminder.service.ts       (ReminderService: schedule, list, cancel)
    ├── reminder.scheduler.ts     (ReminderScheduler: cron job a cada minuto)
    └── __tests__/
        ├── reminder.repository.test.ts
        ├── reminder.service.test.ts
        └── reminder.scheduler.test.ts
```

## Tarefas de Implementação

### Migration
- [x] Criar `003_reminders.sql` (id, user_id FK, remote_jid, message, scheduled_at, fired_at, created_at)

### reminder.repository.ts
- [x] Tipo `Reminder` e interface `IReminderRepository`
- [x] `create(userId, remoteJid, message, scheduledAt)` → Reminder
- [x] `findPending()` → Reminder[] (scheduled_at <= NOW, fired_at IS NULL)
- [x] `markFired(id)` → void
- [x] `findByUser(userId)` → Reminder[]
- [x] `delete(userId, id)` → void

### reminder.repository.test.ts
- [x] Happy: create retorna Reminder mapeado
- [x] Happy: findPending filtra por scheduled_at e fired_at
- [x] Happy: markFired atualiza fired_at
- [x] Happy: findByUser filtra por user_id
- [x] Happy: delete filtra por user_id e id
- [x] Unhappy: create — banco lança → propaga
- [x] Unhappy: findPending — banco lança → propaga

### reminder.service.ts
- [x] `schedule(userId, remoteJid, message, scheduledAt)` → Reminder
- [x] `list(userId)` → Reminder[]
- [x] `cancel(userId, id)` → void

### reminder.service.test.ts
- [x] Happy: schedule delega ao repo
- [x] Happy: list retorna lembretes
- [x] Happy: cancel delega ao repo
- [x] Unhappy: schedule — repo lança → propaga

### reminder.scheduler.ts
- [x] `start()` — inicia cron a cada minuto
- [x] `stop()` — para o cron
- [x] Tick: busca pendentes, envia, marca fired
- [x] Tick: se envio falhar em um → continua os demais

### reminder.scheduler.test.ts
- [x] Happy: start inicia cron com '* * * * *'
- [x] Happy: tick chama findPending, sendText, markFired
- [x] Happy: stop encerra o job
- [x] Unhappy: sendText falha → continua processando outros lembretes

## Ciclo TDD por unidade

### reminder.repository.ts
- [x] Testes escritos e falhando (red)
- [x] Implementação passando (green)
- [x] Refactor sem quebrar

### reminder.service.ts
- [x] Testes escritos e falhando (red)
- [x] Implementação passando (green)
- [x] Refactor sem quebrar

### reminder.scheduler.ts
- [x] Testes escritos e falhando (red)
- [x] Implementação passando (green)
- [x] Refactor sem quebrar

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Unhappy paths cobertos
- [x] Coverage acima dos thresholds (`npm run test:coverage`)
- [x] Limites de arquivo respeitados
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas
