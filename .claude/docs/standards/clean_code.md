---
name: Clean Code e Composição
description: Princípios de código limpo, reaproveitamento e composição
---

**Clean Code**
- Nomes revelam intenção — sem `data`, `info`, `manager` genéricos
- Funções fazem uma coisa — se precisa de "e" para descrever, dividir
- Sem efeitos colaterais ocultos — função que persiste algo deixa isso claro
- Sem números mágicos — constantes nomeadas
- Fail fast — validar entradas no início, retornar cedo, evitar aninhamento profundo

**Composição e Reaproveitamento**
- Composição > herança — combinar módulos pequenos e focados
- Agregação via injeção — receber dependências, não instanciar internamente
- DRY com critério — abstrair com 3+ ocorrências; abstração prematura é pior que repetição
- Buscar antes de criar — verificar se já existe algo que resolve o problema
- Funções puras onde possível — sem estado interno oculto, fáceis de testar e compor
