# Framework Pessoal de Desenvolvimento com Claude Code

> Um sistema vivo de qualidade de código — não uma configuração única, mas um framework que cresce com você.

---

## Visão

A ideia central: ao invés de pedir ao Claude para seguir boas práticas toda vez, você codifica essas práticas no próprio ambiente. O Claude lê suas regras automaticamente, hooks bloqueiam violações antes que aconteçam, skills executam workflows padronizados, e a memória acumula aprendizados entre projetos.

O resultado é um loop de melhoria contínua:

```
você escreve código
  → guardião (hook) detecta violação
  → Claude corrige seguindo seus padrões (CLAUDE.md)
  → você aprova ou corrige a abordagem
  → memory captura o que funcionou / o que foi rejeitado
  → periodicamente: /update-standards propõe evoluções ao CLAUDE.md
  → você aprova → framework cresce → próximo projeto já nasce melhor
```

---

## Diagnóstico Honesto

### O que funciona muito bem

**CLAUDE.md como "compilador de padrões"**
É o mecanismo de maior alavancagem. Você define as regras uma vez, elas são carregadas automaticamente em toda conversa. Há uma hierarquia real:

1. `~/.claude/CLAUDE.md` — universal, carregado em todos os projetos
2. `./CLAUDE.md` ou `./.claude/CLAUDE.md` — específico do projeto (vai para o git)
3. Subdiretórios podem ter seus próprios CLAUDE.md (carregados sob demanda)

**Hooks de verificação rápida**
Hooks que rodam em menos de 100ms (verificar tamanho de arquivo, convenção de nome) têm altíssimo valor com custo zero de UX. O input chega via stdin como JSON estruturado, dando acesso ao caminho do arquivo, ao conteúdo da chamada de ferramenta, e muito mais. Um hook `PreToolUse` pode bloquear a ação com `exit 2` e passar uma mensagem explicativa ao Claude.

**Skills para workflows repetíveis**
Cada skill é um diretório com um arquivo `SKILL.md`. Você invoca com `/nome`. O sistema permite criar processos de múltiplos passos que o Claude executa de forma padronizada toda vez.

**Memória cross-projeto**
Correções e validações feitas em um projeto ficam disponíveis em todos os outros. É o que faz o sistema "aprender" de verdade ao longo do tempo.

### O que precisa de nuance

**"Auto-atualização" é na verdade "evolução assistida"**
O sistema não reescreve suas próprias regras sozinho — isso seria perigoso e você perderia rastreabilidade. O que funciona: memória captura padrões → você roda `/update-standards` periodicamente → Claude propõe mudanças específicas ao CLAUDE.md → você aprova cada uma → framework versiona a mudança no git com justificativa. Você mantém controle total.

**Hooks lentos são inimigos do workflow**
Um hook que adiciona 5 segundos a cada edição vai ser desabilitado em dois dias. Regra de ouro:
- Hooks automáticos: sempre rápidos (< 500ms)
- Testes completos, typecheck global: em skills que você invoca explicitamente

**MCP tem alto valor mas alto custo de setup**
Vale muito a longo prazo (integração com banco, CI/CD, ferramentas externas). Não é ponto de partida — MCP depois que a fundação estiver sólida.

### O que não faz sentido

**Automatizar aprovações de mudanças nos padrões**
Se o Claude pudesse mudar suas próprias regras sem você aprovar, você perderia o histórico de por que as regras existem. Sempre há um humano no loop para mudanças no CLAUDE.md.

**Criar hooks para tudo**
Só onde há valor real e verificação é rápida. Hook de lint completo em cada edição = ruído. Hook de tamanho de arquivo = sinal.

---

## Arquitetura do Framework

```
personal-dev-framework/              ← repositório git central (o framework em si)
│
├── global/
│   ├── CLAUDE.md                    ← instalar em ~/.claude/CLAUDE.md
│   └── settings.json               ← instalar em ~/.claude/settings.json
│
├── templates/
│   ├── nextjs-app/
│   │   ├── CLAUDE.md               ← regras específicas Next.js App Router
│   │   └── .claude/
│   │       └── settings.json       ← hooks do projeto
│   ├── nestjs-api/
│   │   ├── CLAUDE.md
│   │   └── .claude/settings.json
│   └── fullstack-next-nest/
│       ├── CLAUDE.md
│       └── .claude/settings.json
│
├── hooks/
│   ├── check-file-size.js          ← bloqueia editar arquivo acima do limite
│   ├── run-typecheck.sh            ← tsc --noEmit no arquivo editado
│   └── run-lint.sh                 ← eslint no arquivo editado
│
├── skills/
│   ├── bootstrap/SKILL.md          ← /bootstrap novo projeto
│   ├── refactor/SKILL.md           ← /refactor arquivo grande
│   ├── review/SKILL.md             ← /review antes do commit
│   ├── architect/SKILL.md          ← /architect nova feature
│   └── update-standards/SKILL.md  ← /update-standards da memória
│
├── CHANGELOG.md                    ← por que cada regra existe (histórico versionado)
├── install.sh                      ← configura tudo em uma máquina nova
└── README.md
```

---

## Os 5 Pilares

---

### Pilar 1 — CLAUDE.md (o compilador de padrões)

Deve ficar abaixo de 200 linhas — as primeiras 200 linhas do CLAUDE.md são carregadas automaticamente na sessão; o resto é carregado sob demanda ao ler arquivos em subdiretórios.

**`~/.claude/CLAUDE.md` — exemplo concreto para seu caso:**

```markdown
# Padrões de Desenvolvimento

## Princípios Fundamentais
- SOLID: cada classe/módulo tem uma responsabilidade única
- Clean Code: nomes revelam intenção, funções fazem uma coisa
- Antes de criar, verificar se já existe algo similar no projeto
- Mover código, não reescrever lógica ao refatorar

## Limites de Tamanho
- Página orquestradora: máx 150 linhas
- Componente: máx 250 linhas
- Serviço backend: máx 300 linhas
- Se o arquivo alvo exceder esses limites, PROPOR extração antes de editar

## Estrutura de Componentes
- Usados em uma só página: `_components/` dentro da pasta da página
- Usados em 2+ páginas: `components/` global
- Hooks reutilizáveis entre páginas: `hooks/` global

## Regras de Refatoração
- Um PR = um arquivo ou módulo
- Sem mudança de comportamento durante reestruturação
- Código morto encontrado: marcar com `// TODO: remover - código morto`, não deletar agora

## O que NUNCA fazer
- Criar abstrações para "talvez no futuro"
- Adicionar features durante refatoração
- Criar helpers para operações que acontecem em um único lugar
```

**`./CLAUDE.md` no projeto (herda o global, adiciona específico):**

```markdown
# [Nome do Projeto] — Regras Específicas

## Stack
- Frontend: Next.js 14 App Router + TypeScript + Tailwind
- Backend: NestJS + Prisma + PostgreSQL

## Fase Atual
- Fase 1: Reestruturação física — quebrar megapages e serviços grandes
- Não adicionar features, não mudar schema do banco

## Convenções deste projeto
[regras que só se aplicam aqui]
```

---

### Pilar 2 — Hooks (o guardião automático)

**Onde configurar:**

| Arquivo | Escopo |
|---|---|
| `~/.claude/settings.json` | Todos os seus projetos |
| `.claude/settings.json` | Este projeto (commitado) |
| `.claude/settings.local.json` | Este projeto (local, gitignored) |

**Schema de configuração:**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node /Users/seu-usuario/.claude/hooks/check-file-size.js",
            "timeout": 10000
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash /Users/seu-usuario/.claude/hooks/run-typecheck.sh",
            "timeout": 30000,
            "async": true
          }
        ]
      }
    ]
  }
}
```

**Hook de tamanho de arquivo — completo e funcional:**

```javascript
// hooks/check-file-size.js
const fs = require('fs');
const path = require('path');

// Limites por padrão de arquivo (o mais específico vence)
const LIMITS = [
  { pattern: 'page.tsx',      limit: 150 },
  { pattern: 'page.ts',       limit: 150 },
  { pattern: '.service.ts',   limit: 300 },
  { pattern: '.controller.ts',limit: 200 },
  { pattern: '.tsx',          limit: 250 },
  { pattern: '.ts',           limit: 300 },
];

function getLimit(filePath) {
  const basename = path.basename(filePath);
  for (const { pattern, limit } of LIMITS) {
    if (basename.endsWith(pattern)) return limit;
  }
  return 400; // padrão geral
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;

  let data;
  try { data = JSON.parse(input); }
  catch { process.exit(0); } // não bloquear se não conseguir parsear

  const filePath = data?.tool_input?.file_path;
  if (!filePath || !fs.existsSync(filePath)) process.exit(0);

  const ext = path.extname(filePath);
  const isCode = ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  if (!isCode) process.exit(0);

  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').length;
  const limit = getLimit(filePath);

  if (lines > limit) {
    process.stderr.write(
      `BLOQUEADO: ${path.basename(filePath)} tem ${lines} linhas (limite: ${limit}).\n` +
      `Antes de editar, proponha uma extração de módulos para reduzir o arquivo.\n` +
      `Consulte o CLAUDE.md para as convenções de estrutura.\n`
    );
    process.exit(2); // exit 2 = bloqueia a ação, passa o erro ao Claude como contexto
  }

  process.exit(0);
}

main();
```

**Como o bloqueio funciona:**
- `exit 2` bloqueia a ação e passa o conteúdo do stderr como contexto para o Claude
- O Claude recebe a mensagem, entende o problema e propõe extração antes de continuar
- Alternativa estruturada: `exit 0` com JSON `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "..."}}`

**Tipos de hook disponíveis:**

| Tipo | Uso |
|---|---|
| `command` | Shell script — o mais comum |
| `http` | POST JSON para endpoint HTTP externo |
| `prompt` | Avaliação por LLM (Haiku por padrão) — para análise semântica rápida |
| `agent` | Subagent com acesso a ferramentas — para análise complexa |

---

### Pilar 3 — Skills (os workflows repetíveis)

Skills ficam em `.claude/skills/<nome>/SKILL.md` (projeto) ou `~/.claude/skills/<nome>/SKILL.md` (global). Você invoca com `/nome`.

**`~/.claude/skills/refactor/SKILL.md`:**

```markdown
---
name: refactor
description: Quebra um arquivo grande em módulos menores seguindo os padrões do CLAUDE.md
---

# Skill: Refatorar Arquivo

## Processo obrigatório (execute em ordem)

1. **Ler o arquivo alvo** inteiro antes de qualquer mudança
2. **Mapear dependências**: o que é importado por outros arquivos? Use grep para descobrir
3. **Propor estrutura**: liste os componentes/módulos a extrair com seus nomes e responsabilidades.
   Aguardar aprovação antes de criar qualquer arquivo.
4. **Extrair um por vez**: criar cada arquivo, mover o código (não reescrever), atualizar imports
5. **Verificar**: confirmar que o arquivo orquestrador ficou dentro do limite de linhas
6. **Listar o que foi feito**: nome de cada arquivo criado, linhas antes/depois

## Restrições
- Não mudar comportamento — apenas reorganizar
- Não criar abstrações que não existem no código atual
- Não adicionar tratamento de erros ou validações novas
- Código morto encontrado: marcar com `// TODO: remover - código morto`, não deletar
```

**`~/.claude/skills/review/SKILL.md`:**

```markdown
---
name: review
description: Revisa o diff atual contra os padrões do CLAUDE.md antes de commitar
---

# Skill: Revisão de Código

## O que verificar

1. **Tamanho de arquivos**: algum arquivo modificado ultrapassou o limite?
2. **Responsabilidade única**: cada componente/serviço faz uma coisa?
3. **Nomes revelam intenção**: funções, variáveis e componentes têm nomes claros?
4. **Sem código duplicado**: a lógica nova já existe em outro lugar?
5. **Sem features adicionadas acidentalmente**: o PR faz só o que foi pedido?

## Processo
1. Rodar `git diff HEAD` para ver as mudanças
2. Para cada arquivo modificado, verificar os 5 pontos acima
3. Retornar: lista de problemas (se houver) ou "aprovado para commit"
4. Se houver problemas, propor correções específicas antes de continuar
```

**`~/.claude/skills/bootstrap/SKILL.md`:**

```markdown
---
name: bootstrap
description: Configura um novo projeto com os padrões do framework pessoal
---

# Skill: Bootstrap de Novo Projeto

## Perguntas iniciais (fazer antes de qualquer ação)
1. Qual o tipo de projeto? (nextjs-app / nestjs-api / fullstack-next-nest / outro)
2. Qual o nome do projeto?
3. Há alguma convenção específica além do padrão global?

## Processo
1. Copiar o template CLAUDE.md adequado do framework-repo
2. Criar `.claude/settings.json` com os hooks do projeto
3. Criar `.worktreeinclude` com `.env` e `.env.local`
4. Criar estrutura inicial de pastas conforme o template
5. Confirmar que `~/.claude/CLAUDE.md` está instalado (se não, alertar)

## Entregáveis
- `./CLAUDE.md` configurado
- `.claude/settings.json` com hooks ativos
- Estrutura de pastas criada
- Checklist do que ainda precisa ser feito manualmente
```

---

### Pilar 4 — Memory (o aprendizado acumulado)

A memória fica em `~/.claude/projects/<projeto>/memory/`. O arquivo `MEMORY.md` (índice) tem seus primeiros 200 linhas carregados automaticamente a cada sessão. Os arquivos de memória individuais são carregados sob demanda.

**O que guardar:**

| Guardar | Não guardar |
|---|---|
| Padrões que você aprovou | Estrutura de pastas (vai pro CLAUDE.md) |
| Abordagens que você rejeitou e por quê | Soluções de bugs (vai nos commits) |
| Decisões arquiteturais não óbvias | Configurações (vão nos arquivos de config) |
| Preferências de colaboração | Código que você escreveu (está no git) |

**Exemplo de entrada de memória (feedback.md):**

```markdown
---
name: Não criar helpers para operações únicas
type: feedback
---

Não criar funções utilitárias para lógica que aparece em um único lugar.

**Why:** Adiciona complexidade de abstração sem benefício real. Três linhas similares
são melhores que uma abstração prematura que ninguém sabe de onde veio.

**How to apply:** Só extrair para helper quando a mesma lógica aparecer em 3+ lugares
distintos no codebase.
```

---

### Pilar 5 — Subagents + Worktrees (o paralelismo)

Para refatorações grandes, você pode rodar múltiplos agentes em paralelo, cada um em um worktree isolado sem conflito de arquivos:

```
você: "Refatora UsersPageClient.tsx e dispositivos/page.tsx em paralelo"
  ↓
Claude lança dois subagents com isolation: worktree
  ├── Agent A (worktree-users):
  │     extrai UsersTable, UserFormDialog, UserRoleSelector
  └── Agent B (worktree-devices):
        extrai DevicesTable, DeviceFormDialog, DeviceRegistrationFlow
  ↓
Ambos terminam → você revisa e faz merge
```

**Para habilitar worktrees:** crie `.worktreeinclude` na raiz do projeto para copiar arquivos gitignored:

```
# .worktreeinclude
.env
.env.local
.env.development
```

**Skill com worktree isolado** (frontmatter da skill):

```markdown
---
name: refactor-parallel
description: Refatora múltiplos arquivos em paralelo usando worktrees isolados
isolation: worktree
---
```

---

## O Loop de Evolução (a auto-atualização honesta)

```
Sessão de trabalho
  → Claude aplica regras do CLAUDE.md
  → Você corrige ou valida abordagens
  → Memory captura correções e validações automaticamente

A cada 2-3 semanas: rode /update-standards
  1. Claude lê todos os arquivos de memória do tipo feedback
  2. Claude lê o CLAUDE.md atual
  3. Claude identifica padrões: regras confirmadas 3+ vezes, antipadrões recorrentes, gaps
  4. Claude propõe mudanças específicas — UMA POR VEZ — com justificativa
  5. Você aprova ou rejeita cada mudança individualmente
  6. CLAUDE.md atualizado recebe commit no framework-repo
  7. CHANGELOG.md registra a evolução com o porquê
```

**`~/.claude/skills/update-standards/SKILL.md`:**

```markdown
---
name: update-standards
description: Analisa a memória acumulada e propõe evoluções ao CLAUDE.md
---

# Skill: Atualizar Padrões

## Processo

1. Ler `MEMORY.md` e todos os arquivos de memória do tipo `feedback` deste projeto
2. Ler o `~/.claude/CLAUDE.md` atual e o `./CLAUDE.md` do projeto
3. Identificar padrões nas entradas de memória:
   - Regras confirmadas 3+ vezes → podem ser formalizadas
   - Abordagens rejeitadas 2+ vezes → podem virar regras explícitas de "não fazer"
   - Situações não cobertas pelo CLAUDE.md atual (gaps)
4. Para CADA mudança proposta:
   - Mostrar a regra atual (se existir)
   - Mostrar a mudança proposta
   - Mostrar quais entradas de memória motivam a mudança
   - Aguardar aprovação antes de continuar para a próxima
5. Após aprovações: redigir diff do CLAUDE.md e mensagem de commit explicando o porquê

## Restrições
- Nunca fazer mudanças em lote — uma aprovação por mudança
- Nunca remover uma regra sem evidência na memória
- Menos de 2 ocorrências → não propor ainda, aguardar mais evidência
- Nunca aumentar o CLAUDE.md além de 200 linhas — se necessário, consolidar antes de adicionar
```

---

## Roadmap de Implementação

### Fase 1 — Fundação (1-2 dias)
1. Criar `~/.claude/CLAUDE.md` com seus princípios universais
2. Criar o hook `check-file-size.js` e configurar em `~/.claude/settings.json`
3. Criar `./CLAUDE.md` específico para o check-in com a fase atual
4. Testar: tentar editar um arquivo grande e ver o bloqueio funcionar

### Fase 2 — Skills Essenciais (2-3 dias)
1. `/refactor` — a mais usada no dia a dia
2. `/review` — antes de cada commit
3. Testar as duas na Fase 1 do check-in (as megapages)

### Fase 3 — Framework Repo (1 semana)
1. Criar repositório `personal-dev-framework` no GitHub
2. Extrair e organizar o que foi construído nas fases 1-2
3. Templates para `nextjs-app`, `nestjs-api`, `fullstack-next-nest`
4. `/bootstrap` skill
5. `install.sh` para configurar em máquina nova

### Fase 4 — Loop de Evolução (contínuo)
1. `/update-standards` skill
2. Sessões quinzenais de revisão de padrões
3. CHANGELOG versionando a evolução com justificativas

### Fase 5 — Avançado (quando a base estiver sólida)
1. Hook de typecheck automático pós-edição (assíncrono para não bloquear)
2. Subagents com worktrees para refatoração paralela
3. MCP integrations (banco de dados, CI/CD)
4. Hook do tipo `agent` para análise semântica complexa (violações de SOLID que wc -l não detecta)

---

## O Que NÃO Fazer

- **Hooks lentos automáticos**: typecheck completo em cada edição = workflow destruído em dois dias
- **CLAUDE.md com mais de 200 linhas**: perde foco, dilui atenção do modelo
- **Aprovar mudanças de padrões em lote**: você perde o "por quê" de cada regra
- **Começar por MCP**: alto custo de setup, baixo retorno no início
- **Skills para tudo**: só para workflows que você repete 3+ vezes por semana
- **Esquecer o CHANGELOG**: sem ele, em 6 meses você não sabe por que as regras existem
- **Worktrees sem `.worktreeinclude`**: agentes não terão o `.env` e vão quebrar

---

## Referências Técnicas

| Feature | Documentação |
|---|---|
| CLAUDE.md | `claude --help` ou docs oficiais |
| Hooks (schema completo) | `~/.claude/settings.json` — eventos: PreToolUse, PostToolUse, Stop, SessionEnd, FileChanged, e outros |
| Skills | `.claude/skills/<nome>/SKILL.md` ou `~/.claude/skills/<nome>/SKILL.md` |
| Memory | `~/.claude/projects/<projeto>/memory/MEMORY.md` |
| Worktrees | `.worktreeinclude` na raiz do projeto |

---

*Este documento deve migrar para o `personal-dev-framework` repo quando ele for criado.*
*Versão: 2026-04-01*
