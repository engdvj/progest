---
name: Testing Standards
description: O que é um bom teste neste projeto — categorias, o que mockar, convenções e limites de qualidade
---

# Padrão de Testes

## Princípio central

Coverage diz "esse código foi executado". Não diz "está correto". Um teste só tem valor se falha quando o comportamento muda. Testes que nunca quebram por razão real são decoração.

---

## Categorias de teste

### Unidade (obrigatória em todo ciclo TDD)
Testa uma única classe ou função em isolamento. Dependências externas (banco, Redis, HTTP) são **sempre mockadas**.

```
Quando usar: todo módulo novo — repository, service, provider, client
Ferramenta: vitest + vi.mock()
```

### Integração (Fase 5 — após smoke test Docker)
Testa a comunicação real entre módulos: banco de dados real, Redis real, sem mocks de infraestrutura. Valida que o schema, as queries e as respostas externas funcionam juntos.

```
Quando usar: após confirmar que Docker Compose sobe sem erros
Ferramenta: vitest + docker-compose.test.yml (a definir)
```

---

## O que mockar — e o que não mockar

| Mockar ✅ | Não mockar ❌ |
|---|---|
| `pg` (banco) em testes unitários | Lógica de domínio (service, repository) |
| `ioredis` em testes unitários | Transformações de dados (mapRow, encrypt) |
| Chamadas HTTP externas (Groq, Evolution) | Erros customizados (AppError e filhos) |
| `process.env` quando necessário | Tipos e interfaces |

**Nunca mockar a unidade que está sendo testada.** Se você mockoa `UserService` no teste do `UserService`, está testando o mock.

---

## Estrutura obrigatória de um teste

Todo teste segue **Arrange → Act → Assert**:

```ts
it('retorna null quando usuário não existe', async () => {
  // Arrange — montar o cenário
  mockQuery.mockResolvedValue({ rows: [], rowCount: 0 })
  const { UserRepository } = await import('../user.repository.js')
  const repo = new UserRepository()

  // Act — executar a ação
  const result = await repo.findByRemoteJid('inexistente@s.whatsapp.net')

  // Assert — verificar o resultado
  expect(result).toBeNull()
})
```

---

## Convenção de nomes

```
describe('<NomeDoMódulo>')
  describe('<método ou comportamento>')
    it('<o que deve acontecer dado o cenário>')
```

**Ruim:** `it('testa findByRemoteJid')`
**Bom:** `it('retorna null quando usuário não existe')`
**Bom:** `it('lança NotFoundError quando usuário não está na whitelist')`

O nome do teste deve ser uma frase que descreve comportamento observável — não implementação.

---

## Unhappy paths obrigatórios

Todo módulo que depende de infraestrutura externa deve ter ao menos um teste de falha:

```ts
it('propaga erro quando o banco lança exceção', async () => {
  mockQuery.mockRejectedValue(new Error('connection refused'))
  // ...
  await expect(repo.findById(1)).rejects.toThrow('connection refused')
})
```

**Checklist por tipo de módulo:**

| Tipo | Unhappy paths mínimos |
|---|---|
| Repository | banco lança → erro propaga |
| Service | repo lança → erro propaga; input inválido → erro correto |
| Provider (LLM/HTTP) | API retorna erro → AppError com statusCode correto |
| Handler | auth falha → 401; body inválido → 200 silencioso (padrão Evolution) |

---

## Thresholds mínimos de cobertura

Configurados no `vitest.config.ts`. O build falha se não forem atingidos:

| Métrica | Mínimo |
|---|---|
| Statements | 85% |
| Branches | 80% |
| Functions | 90% |
| Lines | 85% |

**Exceções legítimas** (excluídas do coverage):
- `server.ts` — entry point, sem lógica
- `app.ts` — bootstrap, testado via integração
- `**/types.ts` — apenas definições de tipo

---

## O que faz um teste ser "bom o suficiente"

1. **Falha pelo motivo certo** — se você apagar a implementação, o teste falha
2. **Testa comportamento, não estrutura** — se você renomear uma variável interna, o teste não quebra
3. **É determinístico** — roda 100 vezes, dá 100 vezes o mesmo resultado
4. **É independente** — não depende da ordem de execução de outros testes
5. **Cobre ao menos um unhappy path** — além do caminho feliz

---

## Anti-patterns a evitar

```ts
// ❌ Verifica que a string "INSERT" está na query — testa implementação
expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('INSERT'), ...)

// ✅ Verifica o resultado observável
expect(user.remoteJid).toBe('5511999999999@s.whatsapp.net')

// ❌ Teste que sempre passa independente do código
it('não lança erro', async () => {
  await expect(service.save(1, 'tag', 'val')).resolves.not.toThrow()
})

// ✅ Verifica o contrato real
it('retorna Memory com conteúdo descriptografado', async () => {
  const result = await service.save(1, 'senha', 'admin123')
  expect(result.content).toBe('admin123')
  expect(result.tag).toBe('senha')
})
```
