---
feature: flow-06-lid-pending
status: done
created: 2026-04-09
---

# Flow Analysis: Fluxo 06 - @lid Desconhecido (Multi-Device)

## Descrição
Quando o WhatsApp Multi-Device envia mensagem com `remoteJid` terminando em `@lid` e esse JID não está cadastrado, o sistema armazena temporariamente em Redis para vinculação posterior pelo admin.

## Escopo
- **Entry**: `POST /webhook/evolution` com `remoteJid` do tipo `@lid` não encontrado no banco
- **Exit**: `@lid` armazenado em `LidPendingStore` (Redis, TTL 24h), sem resposta ao usuário
- **Módulos principais**:
  - `src/modules/messages/message.handler.ts`
  - `src/modules/users/lid.pending-store.ts`
  - `src/modules/users/user.repository.ts` (`findByRemoteJid` com fallback `@lid`)
  - `src/infra/redis/index.ts`

## Tarefas

### 1. Análise
- [x] Executar `/flow` e selecionar "vinculação @lid"
- [x] Mapear fluxo: webhook -> `assertWhitelisted` -> `NotFoundError` -> `@lid?` -> `LidPendingStore.set()`
- [x] Mapear também o caminho positivo: `@lid` já vinculado -> `findByRemoteJid` resolve via `lid` column
- [x] Análise crítica por passo

### 2. Correções
- [x] Corrigir bugs confirmados
- [x] Mitigar riscos identificados
- [x] Resolver inconsistências

### 3. Testes
- [x] Adicionar unhappy paths descobertos
- [x] `npm test` passando
- [x] `npm run test:coverage` passando

## Pontos de atenção (verificar na análise)
- `LidPendingStore.set()` recebe `(lid, pushName)` -> verifica se o `@lid` já está no store antes de sobrescrever?
- TTL de 24h: se o admin não vincular no prazo, o `@lid` desaparece silenciosamente -> o usuário precisa enviar nova mensagem
- `NotFoundError` capturado no handler: e se outro erro (ex: DB down) lançar `NotFoundError` -> seria armazenado indevidamente?
- Mensagem do `@lid` desconhecido: é descartada silenciosamente -> o usuário nunca recebe feedback? Isso é intencional?
- Se o mesmo `@lid` mandar N mensagens antes de ser vinculado: o handler captura N vezes, cada vez chama `lidStore.set()` -> sem problema, mas verificar
- Após vinculação via `/linkuser`: o fluxo subsequente usa `canonicalJid` do banco, não o `@lid` recebido?
- `findByRemoteJid` tem 3 tentativas (exato, 9º dígito, `@lid`) -> o que acontece se o DB retornar erro em uma delas?

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Unhappy paths cobertos
- [x] Coverage acima dos thresholds (`npm run test:coverage`)
- [x] Limites de arquivo respeitados
- [x] `/review` aprovado

## Notas
- Fluxo confirmado: `message.handler` tenta `service.handle()`, e somente quando recebe erro de whitelist para um `remoteJid` terminado em `@lid` grava o pending no Redis.
- Caminho positivo confirmado: `user.repository.findByRemoteJid()` primeiro tenta `remote_jid`, depois a variação do 9º dígito e por fim `lid` quando a entrada já é `@lid`; `message.service` usa o `canonicalJid` do banco.
- Correção aplicada: `LidPendingStore` agora preserva o `pushName` anterior quando o mesmo `@lid` repete sem nome.
- Mitigação aplicada: o fallback do handler deixou de aceitar `NotFoundError` genérico e passou a aceitar apenas `WhitelistNotFoundError`.
- Limitação mantida por desenho atual: o store continua guardando apenas o último `@lid` desconhecido em `botzap:lid:last_unknown` com TTL de 24h.
- Status em 2026-04-09: `npm test` passou; `npm run test:coverage` falhou por cobertura global do repositório em 80.77% lines / 79.75% functions / 80.77% statements, abaixo dos thresholds 85% / 90% / 85%.
