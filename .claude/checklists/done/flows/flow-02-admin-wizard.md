---
feature: flow-02-admin-wizard
status: done
created: 2026-04-09
---

# Flow Analysis: Fluxo 02 — Comando Admin (wizard multi-step)

## Descrição
Fluxo de processamento de comandos `/slash` por admins e superadmins. Inclui detecção do comando, condução do wizard passo a passo via Redis e efeito final no banco.

## Escopo
- **Entry**: `POST /webhook/evolution` com texto `/comando` de usuário admin/superadmin
- **Exit**: Admin recebe confirmação; DB e/ou Redis podem ser mutados
- **Módulos principais**:
  - `src/modules/admin/admin.service.ts`
  - `src/modules/admin/admin.flow-store.ts`
  - `src/modules/admin/admin.steps.ts`
  - `src/modules/admin/admin.data-steps.ts`
  - `src/modules/users/user.service.ts` (via admin)
  - `src/modules/messages/evolution.client.ts`

## Tarefas

### 1. Análise
- [x] Executar `/flow` e selecionar "wizard admin"
- [x] Mapear fluxo: detecção de `/comando` → escolha de step → execução → resposta
- [x] Mapear sub-fluxo de resolução de número parcial (mínimo 4 dígitos, ambiguidade)
- [x] Análise crítica por passo (bugs, riscos, inconsistências)

### 2. Correções
- [x] Corrigir bugs confirmados encontrados
- [x] Mitigar riscos identificados
- [x] Resolver inconsistências de protocolo/contrato

### 3. Testes
- [x] Adicionar testes para unhappy paths descobertos
- [x] `npm test` passando
- [x] `npm run test:coverage` passando

## Pontos de atenção (verificar na análise)
- TTL de 5 min no `AdminFlowStore` — o que acontece se expirar no meio de um wizard?
- Múltiplos steps em `admin.steps.ts` e `admin.data-steps.ts` — verificar que cada step valida input antes de persistir
- `sendText` usado extensivamente — verificar tratamento de falha de envio em passos intermediários
- Resolução de número parcial: o que acontece quando há empate e o admin envia um índice inválido?
- Verificar que operações destrutivas (`/removeuser`, `/deletememory`) têm confirmação e não são reversíveis sem aviso
- `/clearallsessions` — verifica se há limite ou impacto em usuários com sessões longas

## Quality Gates
- [x] Todos os testes passando (`npm test`)
- [x] Unhappy paths cobertos (ao menos um por step crítico)
- [x] Coverage acima dos thresholds (`npm run test:coverage`)
- [x] Limites de arquivo respeitados
- [x] `/review` aprovado

## Notas
<!-- Observações durante análise -->
- Bugs confirmados na análise:
  - resolução de número parcial existia no código mas não era aplicada nos steps críticos do wizard
  - `admin.data-steps.ts` usava normalização de JID inconsistente e quebrava números brasileiros sem `55`
  - `/deletememory` não pedia confirmação antes da ação destrutiva
  - `/clearallsessions` era imediato e sem proteção para impacto em sessões longas
  - resposta típica após expiração do TTL de 5 minutos podia cair no fluxo normal do bot em vez de orientar o admin
- Mitigações implementadas:
  - helper dedicado para resolver usuário por número/sufixo, com `waiting_choice` validado e re-prompt para índice inválido
  - confirmação explícita para `/clearallsessions` e `/deletememory`
  - aviso para resposta de wizard sem flow ativo, cobrindo expiração provável do TTL
  - extração de `/adduser` para manter arquivos dentro dos limites do repositório
- Validação executada:
  - `npm test`
  - `npm run test:coverage`
