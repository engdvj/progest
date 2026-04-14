---
name: checklist
description: Cria, atualiza e gerencia checklists de features em .claude/checklists/active/
---

# Skill: Checklist de Feature

## Ações disponíveis

### Criar — após aprovação do /architect
1. Copiar `.claude/checklists/_template.md` para `.claude/checklists/active/<nome-da-feature>.md`
2. Preencher descrição e tarefas com base na estrutura aprovada pelo `/architect`
3. Definir `created` com a data atual
4. Informar o caminho do arquivo criado

### Atualizar — durante o desenvolvimento
1. Ler o checklist da feature em andamento
2. Marcar tarefas concluídas (`- [x]`)
3. Adicionar notas relevantes à seção Notas

### Concluir — após todos os gates aprovados
1. Confirmar que todos os quality gates estão marcados
2. Alterar `status: active` para `status: done` no frontmatter
3. Mover o arquivo de `.claude/checklists/active/` para `.claude/checklists/done/`
4. Verificar se há decisões, feedbacks ou regras novas desta feature para registrar em `.claude/memory/`

### Listar — para ver o que está em andamento
1. Listar arquivos em `.claude/checklists/active/`
2. Para cada um, mostrar: nome da feature + tarefas pendentes

## Conexões
- Criado após aprovação do `/architect`
- Quality gates marcados após aprovação do `/review`
- Checklists ativos são carregados no início de sessão via `.claude/memory/MEMORY.md`
