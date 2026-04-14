---
name: review
description: Revisa o diff atual contra os padrões em .claude/memory/ e .claude/docs/standards/ antes de commitar
---

# Skill: Revisão de Código

## O que verificar

1. **Qualidade dos testes** — ver `.claude/docs/standards/testing.md`:
   - Cada módulo novo tem `__tests__/*.test.ts`?
   - Há ao menos um unhappy path por módulo (banco cai, dep. lança, input inválido)?
   - Os nomes descrevem comportamento, não implementação?
   - Os testes testam resultado observável, não strings de SQL ou detalhes internos?

2. **Tamanho de arquivos**: algum arquivo modificado ultrapassou os limites em `.claude/memory/project_limites.md`?

3. **Princípios e padrões**: verificar SOLID, OOP, design patterns e arquitetura hexagonal conforme `.claude/docs/standards/` — o core não importa infraestrutura diretamente, ports/adapters respeitados, patterns aplicados onde cabem

4. **Clean code**: nomes revelam intenção, funções fazem uma coisa, sem efeitos colaterais ocultos

5. **Composição e reaproveitamento**: lógica repetida foi extraída? Módulos são compostos em vez de duplicados? Algo novo poderia ter reusado o que já existe? (ver `.claude/docs/standards/clean_code.md`)

6. **Sem features adicionadas acidentalmente**: a mudança faz só o que foi pedido?

7. **Regras respeitadas**: verificar `.claude/memory/project_regras.md`

## Processo

1. Rodar `git diff HEAD` para ver as mudanças
2. Para cada arquivo modificado, verificar os pontos acima
3. **Rodar `/security` (Modo 2)** — checar vulnerabilidades no diff; problemas de severidade alta bloqueiam aprovação
4. **Rodar coverage** e verificar thresholds:
   ```bash
   cd botzap/backend && npm run test:coverage
   ```
   - Coverage abaixo dos thresholds bloqueia aprovação — adicionar os testes que faltam antes de continuar
5. Retornar: lista de problemas (se houver) ou "aprovado"
6. Se houver problemas, propor correções antes de continuar
7. **Após aprovação**: marcar os quality gates no checklist da feature em `.claude/checklists/active/`
8. **Após aprovação**: executar `/commit` para commitar as mudanças da feature
