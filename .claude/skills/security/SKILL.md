---
name: security
description: Analisa vulnerabilidades, boas práticas e riscos de segurança durante o desenvolvimento
---

# Skill: Security Review

## Quando usar

- **Durante `/architect`** — antes de escrever código, mapear os riscos do módulo que vai ser construído
- **Durante `/review`** — junto com a revisão de código, verificar o diff antes de commitar
- **Standalone** — auditoria pontual em qualquer momento

---

## Modo 1 — Pré-desenvolvimento (junto com /architect)

Quando um novo módulo ou feature está sendo planejado, responder:

### 1. Quais dados esse módulo recebe de fora do sistema?
- Entrada de usuário (formulário, mensagem, parâmetro de URL) → risco de **injection**
- Payload de webhook/API externa → risco de **spoofing / tampering**
- Upload de arquivo → risco de **path traversal / execução de arquivo**

### 2. Quais dados esse módulo lê ou escreve?
- Banco de dados → checar se queries usam **parâmetros** (nunca interpolação de string)
- Cache/Redis → checar se chaves incluem `user_id` para evitar **vazamento entre usuários**
- Sistema de arquivos → checar **path traversal**

### 3. Esse módulo chama uma API externa ou LLM?
- LLM → risco de **prompt injection** (usuário manipulando o comportamento do modelo)
- API externa → checar se credenciais vêm de variável de ambiente, nunca hardcoded
- Dados sensíveis → checar se entram no payload da requisição sem necessidade

### 4. Esse módulo expõe endpoints HTTP?
- Endpoint autenticado? Se não, por quê?
- Rate limiting aplicado?
- Método correto (POST para mutations, não GET)?

**Output esperado:** lista de riscos identificados para o módulo, com severidade (alta/média/baixa) e como mitigar em cada caso.

---

## Modo 2 — Revisão de diff (junto com /review)

Rodar `git diff HEAD` e verificar:

### Checklist obrigatório

- [ ] **Secrets hardcoded** — nenhuma chave, senha, token ou URL interna no código; tudo via variável de ambiente
- [ ] **Queries parametrizadas** — toda query ao banco usa placeholders (`$1`, `?`), nunca interpolação de string
- [ ] **Validação de input** — dados externos (webhook, body, params) são validados com schema (Zod, Joi, etc.) antes de qualquer uso
- [ ] **user_id em toda query** — nenhuma query retorna dados sem filtrar pelo usuário autenticado
- [ ] **Dados sensíveis fora dos logs** — senhas, tokens, IPs privados não aparecem em `console.log`, `logger.info` ou similares
- [ ] **Prompt injection mitigado** — se o módulo manda input do usuário para um LLM, o sistema prompt isola claramente a instrução do conteúdo do usuário
- [ ] **Autenticação em rotas novas** — toda rota nova está protegida ou tem justificativa explícita para ser pública
- [ ] **Dependências auditadas** — se `package.json` foi modificado, rodar `npm audit` e reportar o resultado

### Verificações automáticas a executar

```bash
# Verificar dependências vulneráveis
npm audit --audit-level=moderate

# Buscar padrões de secrets hardcoded
grep -rn "password\s*=\s*['\"].\+" src/
grep -rn "api_key\s*=\s*['\"].\+" src/
grep -rn "secret\s*=\s*['\"].\+" src/

# Buscar interpolação de string em queries SQL
grep -rn "query\`\|query(.*\${\|query(.*+.*user" src/
```

**Output esperado:** lista de problemas encontrados (bloqueantes ou avisos) ou "sem vulnerabilidades identificadas".

---

## Modo 3 — Auditoria standalone

Rodar quando solicitado explicitamente fora do fluxo normal.

1. Executar todas as verificações automáticas do Modo 2
2. Ler os arquivos de configuração (`app.ts`, rotas registradas, middleware)
3. Verificar se há proteção contra:
   - **Brute force** — rate limiting por IP/usuário
   - **Exposição de stack trace** — erros internos não retornam detalhes ao cliente
   - **Headers de segurança** — Helmet ou equivalente configurado
   - **CORS** — configurado explicitamente, não `*` em produção
4. Retornar relatório com: achados, severidade e recomendação de correção

---

## Severidade

| Nível | Critério | Ação |
|---|---|---|
| **Alta** | Exposição de dados, bypass de autenticação, injection | Bloquear — corrigir antes de continuar |
| **Média** | Dados em log, secret em código, validação ausente | Corrigir no mesmo ciclo |
| **Baixa** | Header ausente, rate limit não configurado | Registrar e corrigir na próxima iteração |

## Restrições

- Não bloquear o desenvolvimento por riscos baixos — registrar e seguir
- Não sugerir abstrações de segurança além do necessário para o contexto atual
- Problemas de severidade alta bloqueiam o `/review` — não aprovar sem correção
