---
name: update-standards
description: Analisa a memória acumulada do projeto e propõe evoluções ao CLAUDE.md
---

# Skill: Atualizar Padrões

## Quando usar

Rodar após **4–5 ciclos concluídos** (checklists movidos para `.claude/checklists/done/`). Esse volume garante padrões reais acumulados para analisar — não rodar antes disso.

## Processo

1. Ler `.claude/memory/MEMORY.md` e todos os arquivos de memória do tipo `feedback` em `.claude/memory/`
2. Ler o `CLAUDE.md` atual do projeto
3. Identificar padrões nas entradas de memória:
   - Regras confirmadas 3+ vezes → podem ser formalizadas
   - Abordagens rejeitadas 2+ vezes → podem virar regras explícitas de "não fazer"
   - Situações não cobertas pelo CLAUDE.md atual (gaps)
4. Para **cada mudança proposta**, mostrar:
   - A regra atual (se existir)
   - A mudança proposta
   - Quais entradas de memória motivam a mudança
   - Aguardar aprovação antes de continuar para a próxima
5. Após aprovações: aplicar as mudanças no CLAUDE.md

## Restrições

- Nunca fazer mudanças em lote — uma aprovação por mudança
- Nunca remover uma regra sem evidência na memória
- Menos de 2 ocorrências → não propor, aguardar mais evidência
- Manter o CLAUDE.md abaixo de 200 linhas — se necessário, consolidar antes de adicionar
