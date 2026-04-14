---
name: Stack e justificativas
description: Stack tecnológica escolhida e por que cada peça foi escolhida
type: project
---

- **Node.js 20 + Fastify** — runtime e framework do backend
- **Evolution API (self-hosted via Docker)** — gateway WhatsApp; escolhido por ser self-hosted, gratuito e amplamente usado no Brasil
- **Groq API / Llama 3.3 70B** — LLM do MVP; free tier (~14.400 req/dia), latência baixa via LPU
- **Ollama** — caminho futuro para modelo local (Llama 3, Mistral, Qwen); custo zero, sem dependência externa
- **PostgreSQL 16** — memória persistente, notas, logs
- **Redis 7** — histórico de sessão por usuário (TTL configurável) + scheduler de lembretes
- **node-cron** — agendamento e disparo de lembretes
- **Docker Compose** — sobe toda a stack; é o ambiente tanto de dev quanto de produção

- **@vitest/coverage-v8 2.1.9** — cobertura de testes; deve ser a mesma versão do vitest instalado
- **TypeScript path aliases** — `@modules`, `@infra`, `@providers`, `@shared` mapeados em `tsconfig.json` e `vitest.config.ts`; imports sempre com extensão `.js` (NodeNext)

**Why:** Infraestrutura local (Docker), sem custo de cloud, sem exposição pública. LLM gratuito no MVP com migração para local facilitada pela interface abstrata.
