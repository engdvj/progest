---
feature: users
status: done
created: 2026-04-08
---

# Feature: users

## Descrição
Modelo de usuário com whitelist (ativo/inativo), dois eixos de permissão independentes (nivel + perfil), e operações de gestão via admin. Base de identidade para todos os módulos de domínio.

## Tarefas de Implementação

### `user.repository.ts`
- [x] Definir tipos exportados: `User`, `CreateUserData`, `UpdateUserData`
- [x] Definir interface `IUserRepository` com: `findByRemoteJid`, `findById`, `create`, `update`
- [x] Implementar `UserRepository` com queries parametrizadas via `@infra/db`

### `user.service.ts`
- [x] Implementar `UserService` recebendo `IUserRepository` por injeção
- [x] `assertWhitelisted(remoteJid)` — NotFoundError se ausente, UnauthorizedError se ativo=false
- [x] `findByRemoteJid(remoteJid)` — lookup direto, retorna null se não existe
- [x] `create(data)` — cria novo usuário na whitelist
- [x] `setLevel(id, nivel)` — atualiza nivel do usuário
- [x] `setProfile(id, perfil)` — atualiza perfil do usuário
- [x] `deactivate(id)` — desativa usuário (remove da whitelist efetivamente)

### Testes
- [x] `__tests__/user.repository.test.ts` — mock `@infra/db`, testa queries e mapeamento de rows
- [x] `__tests__/user.service.test.ts` — mock `IUserRepository`, testa regras de negócio

## Ciclo TDD por unidade

### user.repository.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

### user.service.ts
- [x] Teste escrito e falhando (red)
- [x] Implementação mínima passando (green)
- [x] Refactor feito sem quebrar testes

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Limites de arquivo respeitados (hook não bloqueou)
- [x] `/review` aprovado
- [x] Regras do CLAUDE.md verificadas

## Notas
- Tabela `users` já existe em `001_initial.sql` — nenhuma migration nova
- `UserLevel` e `UserProfile` importados de `@shared/types`
- `assertWhitelisted` checa ativo=false como `UnauthorizedError`, não `NotFoundError`
- Todas as queries com parâmetros ($1, $2) — remoteJid é dado externo (Evolution API)
- Instanciação: `new UserService(new UserRepository())` — sem DI container no MVP
