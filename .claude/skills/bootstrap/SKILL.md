---
name: bootstrap
description: Inicializa a infraestrutura e o esqueleto de um novo projeto antes de começar a codar
---

# Skill: Bootstrap de Projeto

## Quando usar
Uma única vez, no início do projeto, antes de qualquer módulo ser desenvolvido.

## Perguntas obrigatórias antes de qualquer ação

Para cada pergunta abaixo: se o usuário não souber ou pedir sugestão, recomendar a melhor opção para o contexto do projeto com justificativa curta — e só seguir após confirmação.

1. **Qual o runtime/framework do backend?** (Node.js + Fastify, NestJS, Python + FastAPI, etc.)
2. **Quais serviços de infraestrutura?** (PostgreSQL, Redis, MongoDB, filas, etc.)
3. **Tem gateway externo?** (Evolution API, Stripe, etc.) — entra no docker-compose
4. **Qual o gerenciador de pacotes?** (npm, pnpm, yarn, bun)
5. **A estrutura de módulos já está definida?** Se sim, quais são — para criar as pastas vazias

## Critérios de sugestão de stack

Usar para guiar recomendações quando o usuário não souber:

| Necessidade | Sugestão | Por quê |
|---|---|---|
| API leve, alta performance | Node.js + Fastify | Baixo overhead, ótimo para I/O intensivo |
| API estruturada, grande equipe | NestJS | Opinativo, DI nativo, escalável |
| Data science / ML no backend | Python + FastAPI | Ecossistema científico, async nativo |
| Banco relacional + relacionamentos | PostgreSQL | Robusto, ACID, extensível |
| Cache / sessão / filas simples | Redis | In-memory, TTL nativo, pub/sub |
| Banco de documentos flexível | MongoDB | Schema-free, bom para dados variáveis |
| Gerenciador de pacotes | pnpm | Mais rápido, economiza disco, monorepo-friendly |
| Monorepo | Turborepo + pnpm | Cache de build, pipelines paralelos |

Sempre justificar a sugestão em uma linha e aguardar confirmação antes de prosseguir.

## Processo

### 1. Infraestrutura (docker-compose.yml)
- Criar `botzap/backend/docker-compose.yml` com todos os serviços respondidos acima
- Criar `botzap/backend/docker-compose.override.yml` vazio para overrides locais (gitignored)
- Serviço da aplicação com hot reload configurado para desenvolvimento

### 2. Package e TypeScript
- Criar `botzap/backend/package.json` com scripts padrão: `dev`, `build`, `start`, `test`
- Criar `botzap/backend/tsconfig.json` com `strict: true`, paths configurados
- Criar `.eslintrc` e `.prettierrc` consistentes com o projeto

### 3. Variáveis de ambiente
- Criar `.env.example` com todas as variáveis necessárias documentadas (sem valores reais)
- Criar `.env` copiado do `.env.example` (gitignored)
- Adicionar ao `.gitignore`: `.env`, `node_modules/`, `dist/`, `docker-compose.override.yml`
- **Chamar `/gen-env`** para preencher automaticamente as variáveis geráveis — senhas, chaves internas e ENCRYPTION_KEY

### 4. Estrutura de pastas
- Criar `botzap/backend/src/` com entry point mínimo (`app.ts` ou `main.ts`)
- Criar pastas dos módulos **vazias** conforme a arquitetura definida em `.claude/docs/PROPOSTA.md` ou informada nas perguntas
- Criar `botzap/backend/src/infra/` para conexões com banco e serviços externos
- Criar `botzap/backend/src/providers/` para abstrações de serviços terceiros
- Não criar código dentro dos módulos — apenas a estrutura de diretórios

### 5. Checklist de sequência
- Criar `.claude/checklists/active/sequencia.md` com a ordem de desenvolvimento dos módulos (dependências mapeadas)
- Este checklist guia qual módulo desenvolver antes do outro

### 6. Verificação final
- Confirmar que `docker compose up` sobe sem erros
- Confirmar que `npm run dev` (ou equivalente) inicia sem erros
- Listar o que foi criado e o que ainda precisa ser preenchido

## Após o bootstrap

Informar ao usuário o que foi criado e o próximo passo:
1. Revisar e ajustar `.claude/checklists/active/sequencia.md` com a ordem dos módulos
2. Iniciar o primeiro módulo da sequência com `/architect`
3. O fluxo a partir daqui: `/architect` → aprovação → `/checklist` → `/tdd` → `/review`

> `/gen-env` já foi chamado durante o passo 3 — informar quais vars ainda precisam ser preenchidas manualmente (chaves de APIs externas).

## Restrições
- Não escrever lógica de negócio — apenas scaffolding
- Pastas de módulos ficam vazias — o conteúdo vem via `/architect` → `/tdd`
- `.env` nunca vai para o git — apenas `.env.example`
- Não instalar dependências além do necessário para o projeto arrancar
