---
name: Fluxo tem que ser completo sempre
description: Feedback sobre completude do ciclo — memórias, checklists e commits não podem ficar pendentes entre iterações
type: feedback
---

Cada iteração deve fechar o ciclo completo: checklist marcado, memórias atualizadas, commit feito. Não acumular débito de processo entre features.

**Why:** Davi apontou em 2026-04-08 que após várias iterações as memórias não haviam sido atualizadas, os checklists não estavam marcados e os commits estavam sem o novo padrão. Isso compromete a qualidade das próximas sessões que dependem dessas informações.

**How to apply:** Ao final de cada feature (após `/review` aprovar e `/commit` feito): verificar se há memórias desatualizadas, marcar o checklist como done e mover para `done/`. Não iniciar a próxima feature com débito de processo pendente.
