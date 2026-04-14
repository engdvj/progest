---
name: tdd
description: Guia um ciclo TDD completo (red → green → refactor → unhappy paths) para uma unidade de código
---

# Skill: TDD

## Referência obrigatória
Antes de começar: ler `.claude/docs/standards/testing.md` para verificar convenções de nome, o que mockar e os thresholds de coverage.

---

## Ciclo obrigatório

### 1. Red — escrever os testes antes do código

**1a. Happy path (caminho feliz)**
1. Identificar a unidade a ser testada (função, módulo, serviço)
2. Criar o arquivo de teste em `botzap/backend/src/**/__tests__/<nome>.test.ts`
3. Escrever testes que descrevem o comportamento esperado no fluxo normal
4. Rodar `cd botzap/backend && npm test -- <padrão-do-arquivo>` e confirmar que **falham**

**1b. Unhappy paths (obrigatório)**

Antes de implementar, identificar e escrever também os testes de falha:

| Tipo de módulo | O que testar |
|---|---|
| Repository | banco lança → erro propaga |
| Service | dep. lança → propaga; input inválido → erro correto |
| Provider (LLM/HTTP) | API retorna erro → AppError com statusCode |
| Handler | auth falha → 401; body inválido → silencioso |

Rodar e confirmar que esses testes também **falham** (red).

---

### 2. Green — implementar o mínimo para passar
1. Escrever apenas o código necessário para os testes passarem
2. Não otimizar, não generalizar — só fazer passar
3. Rodar `cd botzap/backend && npm test` e confirmar que **todos passam** (happy + unhappy)

---

### 3. Refactor — melhorar sem quebrar
1. Limpar o código mantendo os testes verdes
2. Verificar limites de arquivo (`.claude/memory/project_limites.md`)
3. Se arquivo ultrapassar o limite → `/refactor`
4. Rodar `cd botzap/backend && npm test` — devem continuar **passando**

---

### 4. Checklist de qualidade — antes de fechar o ciclo

Verificar cada teste escrito contra estes critérios:

- [ ] **Nome descreve comportamento** — lendo o nome, dá para entender o que o sistema faz sem ver o código
- [ ] **Arrange/Act/Assert** — os três momentos estão claros, mesmo que sem comentários
- [ ] **Falha pelo motivo certo** — se apagar a implementação, o teste falha
- [ ] **Testa resultado, não estrutura** — o teste não verifica nomes de variáveis, strings de SQL ou detalhes internos
- [ ] **Ao menos um unhappy path** — além do caminho feliz

---

### 5. Verificar coverage — após ciclo completo

```bash
cd botzap/backend && npx vitest run --coverage
```

- Se algum threshold não foi atingido → adicionar os testes que faltam antes de continuar
- Os thresholds estão em `vitest.config.ts`: 85% statements, 80% branches, 90% functions

---

### 6. Atualizar checklist
1. Marcar as tarefas TDD concluídas em `.claude/checklists/active/`
2. Marcar quality gate "Testes passando" quando ciclo estiver completo

---

## Estrutura de testes esperada

```
botzap/backend/src/
├── modules/
│   └── <nome-do-modulo>/
│       ├── <nome>.repository.ts
│       ├── <nome>.service.ts
│       └── __tests__/
│           ├── <nome>.repository.test.ts   ← testa repository isolado
│           └── <nome>.service.test.ts      ← testa service com repo mockado
└── providers/
    └── __tests__/
        └── <nome>.provider.test.ts
```

---

## Restrições
- Nunca implementar antes de ter o teste escrito e falhando
- Unhappy paths são obrigatórios — não fechar ciclo só com happy path
- Um ciclo por vez — não pular para a próxima unidade sem fechar o atual
- Testes devem testar comportamento observável, não implementação interna
