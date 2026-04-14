---
name: Tratamento de Erros
description: Padrão de propagação e tratamento de erros em toda a aplicação
---

## Hierarquia de erros

Todos os erros de domínio estendem `AppError` de `@shared/errors`:

```
AppError (base — message + statusCode)
├── NotFoundError       (404) — recurso inexistente ou usuário fora da whitelist
├── UnauthorizedError   (401) — nível de permissão insuficiente
└── ValidationError     (400) — payload inválido ou schema rejeitado
```

Erros de infraestrutura (ex: falha de conexão com o banco) devem ser deixados propagar como `Error` nativo — o handler global do Fastify os captura.

## Regra de propagação

```
módulo/infra  →  service  →  handler  →  Fastify setErrorHandler
     throw         throw       NÃO captura — deixa subir
```

- **Módulos de infra** lançam `Error` nativo para falhas de conexão/config
- **Services** lançam `AppError` (ou subclasse) para falhas de domínio
- **Handlers/routes** não usam try/catch — deixam o erro subir para o `setErrorHandler`
- **`setErrorHandler` no `app.ts`** é o único lugar que formata e devolve a resposta de erro

## Formato de resposta de erro (HTTP)

```json
{ "error": "Mensagem legível para o cliente", "statusCode": 400 }
```

- Nunca incluir `stack`, nome da classe ou detalhes internos na resposta
- `statusCode` vem de `AppError.statusCode`; erros não-`AppError` retornam 500 com mensagem genérica

## Unhandled rejections

No `server.ts`, registrar:

```ts
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
  process.exit(1)
})
```

## Regras

- Nunca silenciar erros com `catch {}` vazio em código de produção
- Nunca logar senha, token ou IP privado dentro de um bloco catch
- Nunca relançar um erro com `throw new Error(originalError.message)` — perde o tipo; usar `throw originalError`
- Validação de input externo (webhook, body HTTP) usa **Zod** — lança `ValidationError` se falhar
