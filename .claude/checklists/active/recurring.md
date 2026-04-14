---
feature: recurring
status: active
created: 2026-04-09
---

# Feature: Hábitos e Tarefas Recorrentes

## Descrição
Permite ao usuário criar hábitos (com tracking de streak e taxa de conclusão) e tarefas recorrentes (notificação sem tracking), configurando horário, dias da semana, categoria e período. Usuários gerenciam os próprios via linguagem natural e slash commands; admins gerenciam de qualquer usuário via wizard.

## Tarefas de Implementação

### Banco de dados
- [ ] `006_recurring_schedules.sql` — tabela principal (id, user_id, remote_jid, title, message, type, category, time_of_day, days_of_week, starts_on, ends_on, active, created_at)
- [ ] `007_habit_logs.sql` — (id, schedule_id FK, user_id, logged_at TIMESTAMPTZ)
- [ ] `008_recurring_fired.sql` — (schedule_id, fired_date DATE) PK composta

### Módulo recurring
- [ ] `recurring.repository.ts` — CRUD + findDueNow() + findByUser() + logHabit() + getProgress()
- [ ] `recurring.service.ts` — validação (days_of_week [0-6], time HH:MM, ends_on >= starts_on), create/update/pause/resume/delete/log/stats
- [ ] `recurring.scheduler.ts` — cron `* * * * *`, advisory lock 405, dispara + insere recurring_fired
- [ ] `recurring.user-commands.ts` — slash commands de usuário: /habits, /pause <id>, /resume <id>, /delete <id>

### Testes
- [ ] `__tests__/recurring.repository.test.ts`
- [ ] `__tests__/recurring.service.test.ts`
- [ ] `__tests__/recurring.scheduler.test.ts`
- [ ] `__tests__/recurring.user-commands.test.ts`

### Split do ToolDispatcher
- [ ] `tool.reminder-memory.handlers.ts` — extrair handlers existentes (reminder + memory)
- [ ] `tool.recurring.handlers.ts` — 8 novas tools: create_recurring, update_recurring, pause_recurring, resume_recurring, delete_recurring, list_recurring, log_habit, get_habit_stats
- [ ] `tool.dispatcher.ts` — reduzir para orquestrador (~75 linhas), injetar RecurringService

### Admin
- [ ] `admin.recurring-steps.ts` — wizard /addrecurring (7 passos) + stepListRecurring + stepRemoveRecurring
- [ ] `admin.steps.ts` — +THEMES entrada Recorrências + `recurring: RecurringService` no StepCtx
- [ ] `admin.service.ts` — +FLOW_PROMPTS + routing /addrecurring /listrecurring /removerecurring + RecurringService no construtor

### Wiring
- [ ] `message.service.ts` — recebe UserCommandService, chama tryHandle() antes do LLM
- [ ] `message.handler.ts` — instancia RecurringService, RecurringScheduler, UserCommandService; start()

## Ciclo TDD por unidade

### recurring.repository.ts
- [ ] Happy paths: red
- [ ] Unhappy paths: red (banco lança → propaga, findByUser retorna [] sem schedules)
- [ ] Green
- [ ] Refactor

### recurring.service.ts
- [ ] Happy paths: red
- [ ] Unhappy paths: red (days_of_week inválido, ends_on < starts_on, log de schedule alheio → NotFoundError, banco cai)
- [ ] Green
- [ ] Refactor

### recurring.scheduler.ts
- [ ] Happy paths: red
- [ ] Unhappy paths: red (lock não adquirido → tick ignorado, envio falha → demais continuam)
- [ ] Green
- [ ] Refactor

### recurring.user-commands.ts
- [ ] Happy paths: red
- [ ] Unhappy paths: red (id inválido, schedule não encontrado, delete sem confirmação)
- [ ] Green
- [ ] Refactor

### tool.recurring.handlers.ts
- [ ] Happy paths: red
- [ ] Unhappy paths: red (parâmetros inválidos, schedule alheio, log em tarefa não-hábito)
- [ ] Green
- [ ] Refactor

## Quality Gates
- [ ] Todos os testes passando (`npm test`)
- [ ] Unhappy paths cobertos (ao menos um por módulo)
- [ ] Coverage acima dos thresholds (`npm run test:coverage`)
- [ ] Limites de arquivo respeitados (hook não bloqueou)
- [ ] `/review` aprovado
- [ ] Regras do CLAUDE.md verificadas

## Notas
- `time_of_day` armazenado como Brasília local (TIME WITHOUT TIME ZONE) — scheduler compara com NOW() AT TIME ZONE 'America/Sao_Paulo'
- `recurring_fired` usa PK composta (schedule_id, fired_date) para impedir double-fire mesmo em restart
- Advisory lock key = 405 (ReminderScheduler usa 404)
- pause ≠ delete: pause seta active=false (reversível), delete remove do banco (irreversível, com confirmação)
- Admin slash commands: /addrecurring /listrecurring /removerecurring
- User slash commands: /habits /pause /resume /delete
