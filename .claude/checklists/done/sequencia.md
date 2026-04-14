# Sequência de Desenvolvimento — BotZap HGVC MVP

> Ordem baseada em dependências: cada módulo só começa quando suas dependências estão prontas.
> Fluxo por módulo: `/architect` → aprovação → `/checklist` → `/tdd` → `/review` → `/commit` → atualizar memórias

---

## Fase 1 — Infraestrutura base

- [x] **1. infra/db** — Conexão PostgreSQL + pool + migrations base
- [x] **2. infra/redis** — Conexão Redis + helpers de TTL
- [x] **3. shared** — Tipos globais, erros customizados, utilitários

---

## Fase 2 — Identidade e acesso

- [x] **4. users** — Modelo de usuário, whitelist, níveis (`usuario/admin/superadmin`), perfis (`tecnico/analista/coordenador`)
  - _Depende de: infra/db_

---

## Fase 3 — Núcleo da conversa

- [x] **5. session** — Histórico de sessão por usuário no Redis (TTL configurável)
  - _Depende de: infra/redis, users_

- [x] **6. llm** — Interface `LLMProvider` + `GroqProvider` (padrão MVP)
  - _Depende de: shared_

- [x] **7. messages** — Webhook da Evolution API, roteamento por `remoteJid`, envio de resposta
  - _Depende de: users, session, llm_

---

## Fase 4 — Funcionalidades

- [x] **8. memory** — Memória persistente por usuário (salvar/recuperar notas, criptografia AES)
  - _Depende de: users, infra/db_

- [x] **9. reminders** — Agendamento com `node-cron`, disparo via Evolution API
  - _Depende de: users, infra/redis, messages_

---

## Fase 5 — Orquestração final

- [x] **10. Integração de módulos no app.ts** — Registrar rotas e plugins no Fastify
  - _Depende de: todos os módulos acima_

- [x] **11. Docker Compose smoke test** — `docker compose up` sem erros, health check `/health` respondendo

---

## Notas

- GLPI é **Fase 3 do roadmap** — não criar nenhuma dependência com ele no MVP
- Criptografia em repouso (AES-256) obrigatória no módulo `memory`
- Toda query ao banco deve filtrar por `user_id`
