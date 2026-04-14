---
name: setup
description: Configura o contexto de um novo projeto — preenche PROPOSTA.md e arquivos de memória antes do /bootstrap
---

# Skill: Setup de Contexto do Projeto

## Quando usar

Uma única vez ao iniciar um projeto novo a partir de um `.claude/` copiado de outro projeto.
Deve rodar **antes** do `/bootstrap`.

## Processo

### 1. Diagnóstico — verificar o que está preenchido

Ler os arquivos abaixo e classificar cada um como **preenchido** (tem conteúdo do projeto atual) ou **pendente** (vazio, ausente ou com conteúdo de outro projeto):

| Arquivo | Papel |
|---|---|
| `.claude/docs/PROPOSTA.md` | Visão do produto, arquitetura, stack, roadmap |
| `.claude/memory/project_decisoes.md` | Decisões técnicas e de produto já tomadas |
| `.claude/memory/project_stack.md` | Stack escolhida e justificativas |
| `.claude/memory/user_perfil.md` | Quem é o usuário, contexto, expertise |

Apresentar o diagnóstico ao usuário antes de continuar:
- Lista o que está **ok** (não será tocado)
- Lista o que está **pendente** (será preenchido)

Se tudo estiver preenchido: informar e encerrar — nada a fazer.

---

### 2. Preencher os pendentes — um por vez

Para cada arquivo pendente, fazer as perguntas abaixo e aguardar resposta antes de ir para o próximo.

---

#### `.claude/docs/PROPOSTA.md`

Perguntar:
1. **Qual o nome e objetivo do projeto?** (em uma linha)
2. **Quem vai usar?** (público-alvo, contexto de uso)
3. **Quais as funcionalidades principais do MVP?** (lista livre)
4. **Tem integrações externas?** (APIs, gateways, serviços terceiros)
5. **Qual o roadmap de fases?** (MVP → próximas fases)
6. **Quais os principais riscos?**

Com as respostas, gerar o `PROPOSTA.md` no formato:
```
# Proposta — <Nome do Projeto>
## 1. Visão do Produto
## 2. Público-alvo
## 3. Funcionalidades MVP
## 4. Arquitetura Sugerida
## 5. Roadmap
## 6. Riscos
```

---

#### `.claude/memory/project_stack.md`

Perguntar:
1. **Qual o runtime/framework do backend?**
2. **Banco de dados?**
3. **Cache/fila?**
4. **Integrações externas?**
5. **Gerenciador de pacotes?**
6. **Por que essas escolhas?** (pode ser curto)

Gerar o arquivo com frontmatter `type: project` e lista de bullets com `**Tecnologia** — papel + justificativa curta`.

---

#### `.claude/memory/project_decisoes.md`

Perguntar:
1. **Quais decisões de produto já foram tomadas?** (o que está fora de discussão)
2. **Quais restrições técnicas existem?** (o que não pode mudar)
3. **O que está explicitamente fora do MVP?**

Gerar o arquivo com frontmatter `type: project` e lista de bullets com cada decisão em negrito seguida de explicação.

---

#### `.claude/memory/user_perfil.md`

Perguntar:
1. **Qual seu papel neste projeto?** (dev solo, tech lead, fullstack, etc.)
2. **Qual sua experiência com a stack escolhida?**
3. **Tem alguma preferência forte de como trabalhar?** (ex: prefere PR pequenos, detesta boilerplate, etc.)

Gerar o arquivo com frontmatter `type: user`.

---

### 3. Atualizar o CLAUDE.md

Após preencher os arquivos, verificar se a seção `## Comandos` e `## Arquitetura` do `CLAUDE.md` refletem o novo projeto.

Se estiverem com conteúdo de outro projeto: perguntar ao usuário e atualizar.

---

### 4. Confirmação final

Listar o que foi preenchido e informar:

> "Contexto configurado. Próximo passo: `/bootstrap` para criar a estrutura de pastas e infraestrutura."

## Restrições

- Não preencher nenhum arquivo sem antes perguntar ao usuário
- Não rodar `/bootstrap` automaticamente — apenas informar que é o próximo passo
- Se um arquivo já tiver conteúdo do projeto atual, não sobrescrever sem confirmação explícita
- `user_perfil.md` pode ser reaproveitado se for o mesmo usuário — perguntar antes de substituir
