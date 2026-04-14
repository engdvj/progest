---
name: Regras de desenvolvimento
description: Regras obrigatórias de desenvolvimento — verificadas em todo /review
type: project
---

- Toda query ao banco filtra por `user_id` — sem exceção.
- LLM sempre via `LLMProvider.chat()` ou `chatWithTools()` — nunca chamado diretamente.
- Usuários comuns interagem via linguagem natural — sem prefixos de comando.
- Admins e superadmins usam `/slash` commands (ver tabela completa no CLAUDE.md). Wizard persiste estado no Redis (`admin:flow:{jid}`, TTL 5 min via `AdminFlowStore`).
- GLPI é Fase 3. Não criar dependências com ele no MVP.
- Criptografia em repouso obrigatória na memória persistente (senhas e IPs são casos de uso explícitos).
- Todo módulo novo tem ao menos um unhappy path testado — banco/Redis falha, dep. lança, input inválido.
- `npm run test:coverage` deve passar (thresholds: 85% stmt / 80% branch / 90% func) antes de aprovar qualquer `/review`.
- `SessionService` e envio sempre usam `canonicalJid` (`user.remoteJid`) — nunca o JID recebido do webhook.
- `WhitelistNotFoundError` (não `NotFoundError` genérico) é o sinal exclusivo para armazenar `@lid` no handler.
- Commits: um por feature/flow — nunca acumular múltiplos módulos no mesmo commit.
