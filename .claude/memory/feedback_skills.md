---
name: Skills devem ser genéricas
description: Como separar o que vai em skills do que vai em CLAUDE.md
type: feedback
---

Skills devem ser fluxos de trabalho genéricos, reutilizáveis em qualquer projeto. Não devem conter regras, restrições ou contexto específico do projeto atual.

**Why:** Davi apontou que checks como "toda query filtra por user_id" ou "LLMProvider nunca chamado diretamente" não fazem sentido em outro projeto. Colocar isso na skill polui e limita a reutilização.

**How to apply:** Se uma regra de review/arquitetura é específica do projeto → vai no `CLAUDE.md`. A skill referencia o `CLAUDE.md` genericamente ("verifique as decisões fixas do CLAUDE.md") sem saber o que tem dentro.
