---
name: deploy
description: Rebuilda e reinicia os containers do Docker Compose, aguarda o backend ficar saudável e mostra os logs recentes
---

# Skill: Deploy / Restart

Atualiza o ambiente Docker Compose após mudanças de código ou dependências.

## Quando usar

| Situação | O que fazer |
|---|---|
| Mudança só em `src/` | Nada — `tsx watch` pega via volume mount automaticamente |
| Variável de ambiente no `.env` | `docker compose up -d --no-deps app` — **nunca `restart`**, que não relê o `.env` |
| `npm install` de novo pacote | `/deploy` — rebuild do `app` necessário |
| Problema estranho / container travado | `/deploy --force` para recriar do zero |

## Processo padrão (`/deploy`)

### 1. Verificar o que mudou

```bash
git diff HEAD --name-only | grep -E "package.*json|Dockerfile"
```

Se mudou `package.json`, `package-lock.json` ou `Dockerfile` → rebuild obrigatório.
Se mudou só `src/` → rebuild desnecessário, mas pode prosseguir se o usuário pediu.

### 2. Rebuild e restart do container `app`

```bash
cd botzap/backend && docker compose build app
cd botzap/backend && docker compose up -d --no-deps app
```

`--no-deps` evita reiniciar PostgreSQL, Redis e Evolution API desnecessariamente.

### 3. Aguardar o backend ficar saudável

Aguardar ~5 segundos e verificar o health check:

```bash
sleep 5 && curl -s http://localhost:3002/health
```

Resultado esperado: `{"status":"ok"}`

Se não responder em ~15 segundos, mostrar os logs de erro:

```bash
cd botzap/backend && docker compose logs app --tail=30
```

### 4. Confirmar e mostrar logs recentes

```bash
cd botzap/backend && docker compose logs app --tail=20
```

Reportar ao usuário:
- Status do health check
- Últimas linhas do log (para confirmação visual)
- Se houve erro de migration, dependency ou env var faltando

---

## Variante `--force` (recriar do zero)

Usar quando: container travado, mudança de network, volumes corrompidos.

```bash
cd botzap/backend && docker compose down --remove-orphans
cd botzap/backend && docker compose build app
cd botzap/backend && docker compose up -d
```

⚠️ `docker compose down` para **todos** os serviços, incluindo Evolution API.
A sessão WhatsApp pode precisar ser reescaneada após subir novamente.

---

## Variante rápida (só recriar, sem rebuild)

Usar quando: mudança de variável no `.env` — `restart` **não relê** o env_file.

```bash
cd botzap/backend && docker compose up -d --no-deps app
sleep 5 && curl -s http://localhost:3002/health
```

> Mudanças em `src/` são captadas automaticamente pelo `tsx watch` via volume — não precisa de restart.

---

## O que NÃO fazer

- Não rodar `docker compose down` sem necessidade — derruba Evolution API e pode perder sessão WhatsApp
- Não usar `docker compose up -d` sem `--no-deps` quando só o `app` mudou — reinicia todos
- Não ignorar erros no health check — migrations que falham ficam silenciosas nos logs

---

## Referência rápida de portas

| Serviço | Host |
|---|---|
| Backend (health) | http://localhost:3002/health |
| Evolution API | http://localhost:8081 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |
