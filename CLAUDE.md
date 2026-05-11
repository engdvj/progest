# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Progest** is a hospital supply/stock management system. It manages product inventory, stock entries (entradas), stock movements between sectors (movimentações), and reporting. The system is used by hospital sectors to request and transfer supplies.

## Session Start Checklist

1. Check `.claude/checklists/active/` — list in-progress work before anything else
2. If a checklist exists: report it and ask whether to continue or open a new task in parallel
3. If no checklist exists and `.claude/docs/PROPOSTA.md` exists: proceed normally with `/architect` → `/checklist` → `/tdd` → `/review` → `/commit`

## Development Commands

### Backend (Laravel 8 — PHP 8.2)

**Local (XAMPP):**
```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve          # http://localhost:8000
```

**Docker (local dev — no SSL):**
```bash
cd backend
cp .env.docker.example .env   # edit APP_KEY, then php artisan key:generate --show
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml exec progest-api php artisan migrate
docker compose -f docker-compose.local.yml exec progest-api php artisan db:seed
```

**Makefile shortcuts (run from `backend/`):**
```bash
make deploy          # down → up → cache-clear → migrate
make first-deploy    # down → up → migrate:fresh → seed  (DESTROYS DATA)
make seed            # run seeders only
make cache-clear     # clear config/route/view/cache
make optimize        # cache for production
make logs            # follow progest-api container logs
```

**Run a single test:**
```bash
docker compose -f docker-compose.local.yml exec progest-api php artisan test --filter TestClassName
# or locally:
php artisan test --filter TestClassName
```

### Frontend (Vue 3 + Vite)

**Local (npm):**
```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_URL=http://localhost:8000/api
npm run dev                 # http://localhost:5173
npm run build
```

**Docker (local dev):**
```bash
cd frontend
cp .env.example .env        # set VITE_API_URL=http://app.localhost/api
docker compose -f docker-compose.local.yml up -d --build
```

**Run tests:**
```bash
npm run test
npm run test:coverage
```

### Docker Network (required for any Docker setup)
```bash
docker network create traefik-public
```

## Architecture

### High-Level Structure

```
progest/
├── backend/    # Laravel 8 REST API (PHP 8.2)
└── frontend/   # Vue 3 SPA (Vite + TailwindCSS)
```

Both services are served via **Traefik** reverse proxy on the same domain (`app.localhost` locally, `sistema-hospital.com.br` in production). Traefik routes `/api/*` requests to the backend container and everything else to the frontend container — this is why CORS is not an issue in Docker; the frontend and API share the same origin.

### Backend Architecture

**Thin controllers, no service layer (yet).** Business logic lives directly in controllers. The two most critical files by complexity are:

- [backend/app/Http/Controllers/RelatoriosController.php](backend/app/Http/Controllers/RelatoriosController.php) — 50KB, contains all reporting business logic
- [backend/app/Http/Controllers/Cadastros/SetoresController.php](backend/app/Http/Controllers/Cadastros/SetoresController.php) — 28KB, sector management including supplier linking

**Key domain concepts:**
- **Setor** — a hospital department/sector. Users are linked to one or more setores; all stock is scoped to a setor.
- **Produto** — a product in the master catalog (not stock itself).
- **Estoque / EstoqueLote** — actual stock quantities, tracked per setor and per lot/batch.
- **Entrada** — a stock intake event with line items (ItensEntrada). Creates or updates EstoqueLote records.
- **Movimentacao** — stock transfer between setores. Has a preview → process flow: create (previews quantities) → confirm (deducts source, increments destination).
- **EstoqueAuditoria** — audit trail for all stock changes, populated by Eloquent observers.

**All routes use `POST` by convention** (except the public health check `GET /api/health` and a few GET endpoints). This is an existing convention — don't change existing routes to REST conventions without coordinating with the frontend.

**Route file:** [backend/routes/api.php](backend/routes/api.php) — all ~200 endpoints defined here. Most routes are unguarded (no auth middleware) — the `auth:sanctum` middleware only wraps a small group at the top. This is a known technical debt.

### Frontend Architecture

**Vue 3 Options API** throughout (Composition API is available but not currently used). State flows:

1. `main.js` bootstraps Axios interceptors (auto-attach Bearer token, global 422/401 handling) and initializes setor context from cookie
2. `router/index.js` guards routes with `requiresAuth` (checks Vuex token) and `requiresSector` (checks cookie)
3. `vuex/store.js` holds: user token, current setor, `modalErrors` (422 field errors mapped by interceptor)
4. `components/ui/feedback-modal` (`$feedback`) — used for validation errors and confirmations; `$toastr` — for success/error toasts

**Modal pattern for CRUD:** Nearly all create/edit operations use modal components (in `src/components/cadastros/`). The largest is [frontend/src/components/cadastros/ModalEntradaEstoque.vue](frontend/src/components/cadastros/ModalEntradaEstoque.vue) at 45KB.

**API helpers:** `src/functions/` contains thin wrappers around Axios calls (e.g., `cad_setores.js`, `cad_produtos.js`). New API calls should follow this pattern — keep API logic out of component `<script>` blocks.

**Environment:** `src/config.js` exports `API_URL` from `import.meta.env.VITE_API_URL`. All Axios calls use this as `baseURL`.

## Key Technical Decisions

- **`Polo` is being renamed to `Unidade`** — both route prefixes exist (`/polo/*` and `/unidade/*`) pointing to the same controllers. Use `Unidade` for new code; don't remove `polo` routes without verifying frontend compatibility.
- **All stock mutations go through Eloquent observers** — don't bypass `EstoqueObserver` by using raw DB queries on the `estoques` table; it won't create audit records.
- **Excel bulk import** uses Maatwebsite Excel (`ProductImport` class). Heavy imports run synchronously — no queue configured.
- **Sanctum token** is stored in Vuex and persisted in localStorage (standard Sanctum SPA pattern). The token is sent as `Authorization: Bearer` header on every request.

## Environment Variables

**Backend** (copy from `.env.docker.example` for Docker, `.env.example` for XAMPP):

| Variable | Docker value | Local (XAMPP) value |
|---|---|---|
| `DB_HOST` | `mysql` | `127.0.0.1` |
| `DB_USERNAME` | `progest` | `root` |
| `DB_PASSWORD` | `progest_secret` | *(empty)* |
| `APP_DOMAIN` | `app.localhost` | `localhost` |
| `APP_KEY` | *(generate)* | *(generate)* |

**Frontend** (create `frontend/.env`):

| Variable | Docker value | Local (npm) value |
|---|---|---|
| `VITE_API_URL` | `http://app.localhost/api` | `http://localhost:8000/api` |

## Development Workflow

```
/architect → aprovação → /checklist → /tdd → /review → /commit
```

- One commit per feature — never bundle multiple features
- Never commit with failing tests
- After closing a feature, check if new decisions or rules should be saved to `.claude/memory/`
