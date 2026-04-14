---
name: gen-env
description: Gera valores seguros para variáveis de ambiente vazias ou com placeholder — hex via crypto, sem risco de encoding
---

# Skill: Gerador de Variáveis de Ambiente

## Quando usar

- Chamada automaticamente pelo `/bootstrap` após criar o `.env`
- Quando o usuário adicionar novas variáveis ao `.env.example`
- Sempre que houver vars vazias ou com placeholder no `.env`

## Processo

### 1. Localizar o(s) arquivo(s) .env

Procurar recursivamente a partir da raiz do projeto por arquivos `.env` que não sejam `.env.example`.
Listar os encontrados e confirmar com o usuário qual(is) preencher se houver mais de um.

### 2. Identificar variáveis pendentes

Para cada `.env` encontrado, listar variáveis que estejam:
- Vazias (`VAR=`)
- Com placeholder: `changeme`, `your_*`, `<*>`, `TODO`, `xxx`, `replace_me`, `insert_*`

### 3. Classificar e decidir como tratar cada variável

| Tipo | Padrão de nome | Ação |
|---|---|---|
| Senha de serviço | `*_PASSWORD`, `*_PASS` | Gerar — `randomBytes(24).toString('hex')` |
| Chave de API interna | `*_API_KEY`, `*_SECRET`, `*_TOKEN` sem serviço externo conhecido | Gerar — `randomBytes(24).toString('hex')` |
| Chave de criptografia | `ENCRYPTION_KEY`, `SECRET_KEY`, `*_ENCRYPTION_*` | Gerar — `randomBytes(32).toString('hex')` (AES-256) |
| Chave de API externa | Groq, Stripe, OpenAI, Twilio, SendGrid, etc. | **Nunca gerar** — informar ao usuário que ele precisa obter |
| URL / host / porta | `*_HOST`, `*_URL`, `*_PORT` | **Nunca alterar** — tem valor de infra, confirmar com usuário |
| Configuração numérica | `PORT`, `*_TTL`, `*_MAX_*` | **Nunca alterar** — tem padrão definido |

Em caso de dúvida sobre o tipo: perguntar ao usuário antes de gerar.

### 4. Gerar os valores

Usar Node.js (disponível em qualquer ambiente):

```bash
node -e "
const c = require('crypto');
console.log('senha:', c.randomBytes(24).toString('hex'));
console.log('aes256:', c.randomBytes(32).toString('hex'));
"
```

**Por que hex?**
- Sem `$`, `!`, `"`, `'`, `\`, `#`, `=` — seguro em shell, Docker Compose, `.env`, YAML, JSON
- Zero risco de encoding em qualquer SO ou editor

### 5. Preencher e confirmar

- Substituir apenas as variáveis pendentes no `.env`
- Nunca sobrescrever valor real já existente
- Confirmar listando: nome da variável + tamanho em chars — **nunca mostrar o valor**
- Informar quais vars externas ainda precisam ser preenchidas manualmente pelo usuário

## Restrições

- Nunca gerar chaves de APIs externas — vêm do provider (Groq, Stripe, etc.)
- Nunca exibir os valores gerados na resposta
- Nunca sobrescrever valor que não seja vazio ou placeholder
- Sempre usar `crypto.randomBytes()` — nunca `Math.random()` ou timestamps
- `.env` nunca vai para o git — verificar `.gitignore` se suspeitar
