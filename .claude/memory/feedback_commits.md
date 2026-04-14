---
name: Commits com corpo explicativo em linguagem simples
description: Todo commit precisa de corpo em linguagem simples além da linha técnica
type: feedback
---

Todo commit deve ter, além da linha técnica (Conventional Commits), um corpo de 1–3 frases em linguagem simples que qualquer pessoa consiga entender — sem jargão técnico.

**Why:** Davi pediu explicitamente em 2026-04-08. O histórico git deve ser legível por qualquer pessoa, não só por quem conhece o código. Commits anteriores foram refeitos para seguir esse padrão.

**How to apply:** Usar HEREDOC para commits com múltiplas linhas. Nunca commitar só com a linha de título. Ver exemplos em `.claude/skills/commit/SKILL.md`.

Um commit por feature/flow — nunca acumular múltiplos módulos ou flows no mesmo commit. Em 2026-04-09 um mega-commit com flows 02-06 foi desfeito e refeito em 5 commits separados a pedido do Davi.
