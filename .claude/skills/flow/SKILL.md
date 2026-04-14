---
name: flow
description: Traça e analisa o fluxo de execução de uma feature passo a passo — verifica funcionalidade, detecta bugs lógicos e identifica lacunas de integração
---

# Skill: Flow Analysis

## Quando usar

- Suspeita de bug mas o teste não captura (ou o teste não existe)
- Antes de modificar uma feature crítica
- Após integrar múltiplos módulos para verificar se as peças se encaixam
- Revisão pós-implementação de fluxos que atravessam vários arquivos

---

## Etapa 1 — Delimitar o escopo

Se o usuário passou argumento (`/flow <feature>`), usar como ponto de partida.
Se não, perguntar: "Qual feature ou fluxo analisar?"

Exemplos de flows neste projeto:
- `mensagem recebida` — do webhook até o envio da resposta
- `criação de lembrete` — do intent do LLM até o disparo
- `vinculação @lid` — do @lid desconhecido até o usuário mapeado
- `expiração de sessão` — do scheduler até o resumo salvo em memória
- `wizard admin` — do /comando até o efeito no banco

Identificar e listar antes de continuar:
- **Entry point** — onde o fluxo começa (webhook, cron, comando admin, chamada direta)
- **Exit point** — o que deve ter acontecido ao final (mensagem enviada, registro criado, sessão limpa...)
- **Módulos envolvidos** — arquivos que participam, em ordem de chamada estimada

---

## Etapa 2 — Rastrear o fluxo

Ler todos os arquivos do fluxo. Para cada módulo, mapear explicitamente:

```
[Módulo] nomeFunção(entrada) → transforma X em Y → chama [próximo módulo] → produz efeito Z
```

Identificar neste passo:
- Dependências injetadas vs. instanciadas internamente
- Onde o fluxo pode se bifurcar (if/else de negócio)
- Onde o fluxo pode terminar prematuramente (throw, return sem resposta)
- Efeitos colaterais (escrita no banco, Redis, envio de mensagem)

Apresentar o mapa antes de prosseguir para a análise.

---

## Etapa 3 — Análise crítica por passo

Para cada passo no mapa de execução, responder as perguntas abaixo.
Registrar apenas achados relevantes — não listar "ok" para tudo.

### Funcionalidade
- Este código faz o que o nome/assinatura sugere?
- Existe alguma entrada válida que produz comportamento não esperado?

### Validação de entrada
- O que acontece com input malformado, vazio, tipo errado, out-of-range?
- O erro é tratado com contexto ou vaza genérico para cima?

### Propagação de erro
- Se este passo lançar exceção, quem captura? O que é feito?
- Risco de resposta parcial: algum efeito colateral já aconteceu antes do throw?

### Consistência de estado
- Se falhar no meio, o estado no banco/Redis fica inconsistente?
- Operações que deveriam ser atômicas estão em transação?

### Suposições implícitas
- O código assume que outro módulo já rodou antes?
- Assume dados em formato específico sem validar?
- Assume que o ambiente (env vars, serviços externos) está saudável?

### Integração
- O tipo/formato do output deste passo é exatamente o que o próximo espera?
- Existe desacoplamento que pode divergir sem erro em compile-time?

### Regras do projeto (checar sempre)
- Toda query ao banco filtra por `user_id`?
- LLM chamado via `LLMProvider.chat()` ou `chatWithTools()`, nunca diretamente?
- Sessão e envio usam sempre o `canonicalJid` (`user.remoteJid`), nunca o JID recebido do webhook?
- Dados sensíveis criptografados antes de persistir?

---

## Etapa 4 — Relatório

Estruturar o output em quatro seções. Omitir seções sem achados.

### Bugs (comportamento confirmadamente errado)
Para cada bug:
- Arquivo e linha
- Comportamento atual vs. comportamento esperado
- Condição para reproduzir

### Riscos (podem quebrar, dependendo de contexto)
Para cada risco:
- Condição necessária para o problema se manifestar
- Impacto esperado se ocorrer

### Inconsistências (peças que não se encaixam)
Contratos quebrados entre módulos, suposições não atendidas, configurações contraditórias.

### Sugestões
Apenas se for diretamente relacionado a um achado. Não propor melhorias fora do escopo dos problemas identificados.

---

## Restrições

- Análise apenas — nenhum arquivo é editado durante o `/flow`
- Se precisar de mais contexto para confirmar um bug, dizer explicitamente "hipótese" em vez de reportar como fato
- Não reportar como problema comportamentos documentados no CLAUDE.md como intencionais
- Não propor refatorações por estética — apenas por comportamento incorreto ou risco real
- Ao final, se houver bugs confirmados: sugerir `/tdd` para cobertura ou correção direta, a critério do usuário
