---
feature: nome-da-feature
status: active
created: YYYY-MM-DD
---

# Feature: Nome da Feature

## Descrição
[O que essa feature faz e por que existe]

## Tarefas de Implementação
<!-- Geradas pelo /architect após aprovação da estrutura -->
<!-- Cada tarefa segue o ciclo /tdd: red → green → refactor -->
- [ ] ...

## Ciclo TDD por unidade
<!-- Repetir para cada módulo/serviço da feature -->
- [ ] Happy path: testes escritos e falhando (red)
- [ ] Unhappy paths: testes de falha escritos e falhando (red)
- [ ] Implementação mínima passando (green)
- [ ] Refactor feito sem quebrar testes

## Quality Gates
- [ ] Todos os testes passando (`npm test`)
- [ ] Unhappy paths cobertos (ao menos um por módulo — banco/dep. falha, input inválido)
- [ ] Coverage acima dos thresholds (`npm run test:coverage`)
- [ ] Limites de arquivo respeitados (hook não bloqueou)
- [ ] `/review` aprovado
- [ ] Regras do CLAUDE.md verificadas

## Notas
<!-- Observações, decisões tomadas durante implementação -->
