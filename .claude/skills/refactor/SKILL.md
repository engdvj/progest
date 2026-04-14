---
name: refactor
description: Quebra um arquivo grande em módulos menores seguindo os padrões em .claude/memory/ e .claude/docs/standards/
---

# Skill: Refatorar Arquivo

## Processo obrigatório (execute em ordem)

1. **Ler o arquivo alvo** inteiro antes de qualquer mudança
2. **Mapear dependências**: o que importa deste arquivo? Use grep para descobrir
3. **Propor estrutura**: liste os módulos a extrair com nomes e responsabilidades. Aguardar aprovação antes de criar qualquer arquivo
4. **Extrair um por vez**: criar cada arquivo, mover o código (não reescrever), atualizar imports
5. **Verificar**: confirmar que o arquivo original ficou dentro dos limites de `.claude/memory/project_limites.md`
6. **Resumo**: nome de cada arquivo criado, linhas antes/depois
7. **Se houver checklist ativo para a feature**: atualizar as tarefas concluídas em `.claude/checklists/active/`

## Restrições

- Não mudar comportamento — apenas reorganizar
- Não criar abstrações que não existem no código atual
- Não adicionar tratamento de erros ou validações novas durante refatoração
- Código morto encontrado: marcar com `// TODO: remover - código morto`, não deletar agora
- Um módulo por vez — não extrair tudo de uma vez só
