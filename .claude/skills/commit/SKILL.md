---
name: commit
description: Commita as mudanças atuais seguindo Conventional Commits, de forma pontual e organizada
---

# Skill: Commit

## Quando usar

- Sempre após `/review` aprovar uma feature
- Após correções de bug ou ajustes pontuais
- **Nunca** acumular múltiplas features em um único commit

## Processo obrigatório

### 1. Verificar o estado atual
```bash
git status
git diff HEAD
```
- Identificar quais arquivos fazem parte da mudança atual
- Se houver arquivos não relacionados à mudança, **não os incluir** — fazer commits separados

### 2. Confirmar que os testes passam
```bash
cd botzap/backend && npm test
```
- Nunca commitar com testes falhando

### 3. Montar a mensagem de commit

**Formato obrigatório — Conventional Commits:**
```
<type>(<scope>): <descrição curta em português>

<explicação em linguagem simples>
```

A **primeira linha** é técnica e segue o padrão Conventional Commits.
O **corpo** é obrigatório: 1 a 3 frases em linguagem simples explicando o que foi feito e por quê — de forma que alguém sem contexto técnico entenda o que mudou no sistema.

**Types:**

| Type | Quando usar |
|---|---|
| `feat` | Novo módulo, nova funcionalidade |
| `fix` | Correção de bug |
| `test` | Adicionar ou corrigir testes |
| `refactor` | Reorganização de código sem mudança de comportamento |
| `chore` | Configuração, CI, deps, hooks, skills, docs de processo |
| `docs` | Documentação (CLAUDE.md, standards, PROPOSTA.md) |

**Scope** — nome do módulo ou área:
`infra/db`, `infra/redis`, `shared`, `users`, `session`, `llm`, `messages`, `memory`, `reminders`, `app`, `hooks`, `ci`

**Exemplos:**
```
feat(infra/redis): adiciona client Redis com helpers de TTL

Criamos a conexão com o Redis, que é o banco de dados de velocidade
usada para guardar o histórico de conversa de cada usuário por tempo
limitado. Sem ele, o bot não consegue lembrar o que foi dito antes.
```

```
feat(users): implementa modelo de usuário, whitelist e permissões

Agora o sistema sabe quem pode usar o bot. Apenas usuários cadastrados
e ativos conseguem conversar — os demais são bloqueados automaticamente.
```

```
fix(messages): corrige filtro de mensagens fromMe

O bot estava respondendo às próprias mensagens, criando um loop.
Corrigimos para ignorar qualquer mensagem enviada pelo próprio bot.
```

### 4. Selecionar os arquivos e commitar

Preferir `git add` por arquivo/diretório em vez de `git add .`:

```bash
# Exemplo para um módulo completo
git add botzap/backend/src/modules/users/
git add botzap/backend/src/infra/db/migrations/

# Commitar com corpo explicativo (HEREDOC obrigatório para múltiplas linhas)
git commit -m "$(cat <<'EOF'
feat(users): implementa modelo de usuário, whitelist e permissões

Agora o sistema sabe quem pode usar o bot. Apenas usuários cadastrados
e ativos conseguem conversar — os demais são bloqueados automaticamente.
EOF
)"
```

### 5. Verificar o commit
```bash
git log --oneline -5
```

## Regras

- **Um commit por módulo/feature** — não misturar `infra/redis` com `shared` no mesmo commit
- **Nunca incluir `.env`** — verificar `.gitignore` se suspeitar
- **Nunca usar `git add .` ou `git add -A`** sem revisar o diff antes
- **Nunca commitar com `--no-verify`** — os hooks existem por razão
- **Commits de infraestrutura/processo** (skills, hooks, CLAUDE.md) vão separados do código de feature

## Ordem sugerida para commitar acúmulo de mudanças

Se houver várias features não commitadas, commitar nesta ordem (dependências primeiro):

1. Infra (`infra/db`, `infra/redis`)
2. Shared (`shared`)
3. Módulos de domínio (`users`, `session`, `llm`, etc.)
4. Infraestrutura de processo (`hooks`, `skills`, CLAUDE.md)
