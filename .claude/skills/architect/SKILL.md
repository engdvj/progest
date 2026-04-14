---
name: architect
description: Planeja a implementação de um novo módulo ou feature antes de escrever qualquer código
---

# Skill: Arquitetar Feature

## Processo obrigatório (execute em ordem)

1. **Entender o pedido**: perguntar o que for ambíguo antes de qualquer análise
2. **Ler o CLAUDE.md e `.claude/docs/PROPOSTA.md`** para garantir alinhamento com as decisões e restrições existentes
3. **Mapear impacto**: quais módulos existentes serão afetados? Quais arquivos serão tocados?
4. **Verificar reutilização**: existe algo parecido já implementado que pode ser estendido ou composto? Buscar antes de criar. (OCP + DRY + composição — ver `.claude/docs/standards/clean_code.md`)
5. **Rodar `/security` (Modo 1)** — mapear riscos do módulo; os riscos encontrados devem informar a estrutura proposta no próximo passo
6. **Propor estrutura** seguindo os padrões em `.claude/docs/standards/` (SOLID, OOP, patterns, arquitetura hexagonal):
   - Quais arquivos serão criados e onde — **incluindo os arquivos de teste** (`__tests__/*.test.ts`)
   - Para cada arquivo de teste, listar os unhappy paths obrigatórios (banco cai, dep. lança, input inválido) — ver `.claude/docs/standards/testing.md`
   - Interface pública de cada módulo (o que entra, o que sai)
   - Como se integra ao que já existe
   - Estimativa de linhas por arquivo (deve respeitar os limites em `.claude/memory/project_limites.md`)
   - Requisitos de segurança identificados no passo anterior já incorporados
7. **Aguardar aprovação** antes de escrever qualquer código
8. **Após aprovação**: usar `/checklist` para criar o arquivo de acompanhamento em `.claude/checklists/active/`

## Restrições

- Não começar a codar antes da aprovação da estrutura
- Não propor abstrações além do necessário para a feature atual
- Se a estrutura proposta vai gerar arquivos grandes, já propor a divisão correta desde o início
