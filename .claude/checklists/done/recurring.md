---
feature: recurring
status: done
created: 2026-04-09
completed: 2026-04-09
---

# Feature: Hábitos e Tarefas Recorrentes

## Descrição
Permite ao usuário criar hábitos (com tracking de streak e taxa de conclusão) e tarefas recorrentes (notificação sem tracking), configurando horário, dias da semana, categoria e período. Usuários gerenciam os próprios via linguagem natural e slash commands; admins gerenciam de qualquer usuário via wizard.

## Tarefas de Implementação

### Banco de dados
- [x] `006_recurring_schedules.sql` — tabela principal (id, user_id, remote_jid, title, message, type, category, time_of_day, days_of_week, starts_on, ends_on, active, created_at)
- [x] `007_habit_logs.sql` — (id, schedule_id FK, user_id, logged_at TIMESTAMPTZ)
- [x] `008_recurring_fired.sql` — (schedule_id, fired_date DATE) PK composta

### Módulo recurring
- [x] `recurring.repository.ts` — CRUD + findDueNow() + findByUser() + logHabit() + getProgress()
- [x] `recurring.service.ts` — validação (days_of_week [0-6], time HH:MM, ends_on >= starts_on), create/update/pause/resume/delete/log/stats
- [x] `recurring.scheduler.ts` — cron `* * * * *`, advisory lock 405, dispara + insere recurring_fired
- [x] `recurring.user-commands.ts` — slash commands de usuário: /habits, /pause <id>, /resume <id>, /delete <id>

### Testes
- [x] `__tests__/recurring.repository.test.ts`
- [x] `__tests__/recurring.service.test.ts`
- [x] `__tests__/recurring.scheduler.test.ts`
- [x] `__tests__/recurring.user-commands.test.ts`

### Split do ToolDispatcher
- [x] `tool.reminder-memory.handlers.ts` — extrair handlers existentes (reminder + memory)
- [x] `tool.recurring.handlers.ts` — 8 novas tools: create_recurring, update_recurring, pause_recurring, resume_recurring, delete_recurring, list_recurring, log_habit, get_habit_stats
- [x] `tool.dispatcher.ts` — reduzido para orquestrador (~47 linhas), injeta RecurringService

### Admin
- [x] `admin.recurring-steps.ts` — wizard /addrecurring (7 passos) + stepListRecurring + stepRemoveRecurring
- [x] `admin.steps.ts` — +THEMES entrada Recorrências + `recurring: RecurringService` no StepCtx
- [x] `admin.service.ts` — +FLOW_PROMPTS + routing /addrecurring /listrecurring /removerecurring + RecurringService no construtor

### Wiring
- [x] `message.service.ts` — recebe UserCommandService, chama tryHandle() antes do LLM; system prompt instrui LLM a usar -03:00
- [x] `message.handler.ts` — instancia RecurringService, RecurringScheduler, UserCommandService; start()

## Quality Gates
- [x] Todos os testes passando (`npm test`) — 375 testes, 37 arquivos
- [x] Unhappy paths cobertos (ao menos um por módulo)
- [x] Coverage acima dos thresholds (`npm run test:coverage`) — 85%+ stmt, 80%+ branch, 90%+ func
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] Regras do CLAUDE.md verificadas

## Notas
- `time_of_day` armazenado como Brasília local (TIME WITHOUT TIME ZONE) — scheduler compara com NOW() AT TIME ZONE 'America/Sao_Paulo'
- `recurring_fired` usa PK composta (schedule_id, fired_date) para impedir double-fire mesmo em restart
- Advisory lock key = 405 (ReminderScheduler usa 404)
- pause ≠ delete: pause seta active=false (reversível), delete remove do banco (irreversível, com confirmação)
- Admin slash commands: /addrecurring /listrecurring /removerecurring
- User slash commands: /habits /pause /resume /delete
- Formato ISO aceito para lembretes: Z ou -03:00 (LLM instruid a usar -03:00)
- FUTURE_DATE nos testes usa -03:00 offset sem milissegundos (regex não aceita .mmmZ)
