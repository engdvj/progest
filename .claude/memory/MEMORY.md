# MEMORY.md — Índice de Memórias do Projeto

## Leitura obrigatória (toda sessão)
- Verificar arquivos em [`.claude/checklists/active/`](../checklists/active/) — o que está em andamento (pode estar vazio)

## Comportamento obrigatório ao iniciar sessão

**1. Sempre reportar o estado atual antes de qualquer ação:**
- Se houver checklists em `.claude/checklists/active/`: listar o que está em andamento e qual é a próxima tarefa pendente
- Se não houver: informar que não há nada em andamento

**2. Se o usuário pedir para continuar** ("vamos dar sequência", "continua", "onde paramos" ou similar):
- Ler o checklist ativo e retomar da primeira tarefa não concluída — sem perguntar

**3. Se o usuário pedir algo novo mas houver checklist ativo:**
- Sinalizar o pendente e perguntar: continuar ou abrir novo em paralelo?
- Não iniciar sem confirmação

**4. Se não houver nada ativo:**
- Se `.claude/docs/PROPOSTA.md` estiver ausente ou vazio → sugerir `/setup` primeiro (contexto do projeto não configurado)
- Se contexto ok mas `botzap/backend/src/` não existir → sugerir `/bootstrap`
- Se `botzap/backend/src/` existir → fluxo normal: `/architect` → aprovação → `/checklist` → `/tdd`

## Fluxo obrigatório por feature

```
/architect → aprovação → /checklist → /tdd → /review → /commit → atualizar memórias
```

- `/commit` é parte do fluxo — executar sempre após `/review` aprovar
- Um commit por feature/módulo — nunca acumular várias features no mesmo commit
- Nunca commitar com testes falhando
- **Ao fechar cada feature**: verificar se há decisões, feedbacks ou regras novas para registrar em `.claude/memory/`

## Planos futuros (não bloqueia o MVP)
- [project_multiagent.md](project_multiagent.md) — orquestrador Claude + executor Codex

## Leitura sob demanda

**Iniciando feature ou tomando decisão técnica:**
- [project_decisoes.md](project_decisoes.md)
- [project_stack.md](project_stack.md)
- [project_limites.md](project_limites.md)

**Arquitetando ou revisando código:**
- [`docs/standards/`](../docs/standards/) — SOLID, OOP, patterns, arquitetura, testes

**Rodando `/update-standards`:**
- Todos os arquivos `feedback_*.md` desta pasta

**Só se explicitamente perguntado:**
- [user_perfil.md](user_perfil.md)
- [feedback_skills.md](feedback_skills.md)
- [feedback_fluxo.md](feedback_fluxo.md)
- [feedback_commits.md](feedback_commits.md)
