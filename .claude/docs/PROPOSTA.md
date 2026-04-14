# Proposta de Arquitetura — BotZap HGVC
## Assistente Interno de TI via WhatsApp

---

## 1. Visão do Produto

Um assistente pessoal de TI acessível via WhatsApp com quem você **conversa livremente**: faz perguntas, dá contexto, pede para salvar informações, agenda lembretes e consulta chamados — tudo em linguagem natural, sem comandos fixos. O GLPI é uma integração futura; a conversa é o centro.

Uso interno, sem exposição pública.

---

## 2. Modelo de Identidade, Privacidade e Níveis de Acesso

Cada usuário é identificado pelo **número de WhatsApp**. A autenticação é implícita — só quem tem o aparelho consegue mandar mensagem. Toda memória, histórico e lembretes são **privados e isolados por número** por padrão.

### 2.1 Isolamento por padrão

```
Davi (tecnico)      → acessa só a própria memória
João (analista)     → acessa só a própria memória
Maria (coordenador) → acessa memória própria + visão de equipe (via perfil)
```

**Como funciona na prática:**
- O backend identifica o `remoteJid` (número) via Evolution API
- Todas as queries ao banco são filtradas por `user_id` por padrão
- Não existe forma de um usuário acessar dados de outro sem permissão explícita
- Novos números precisam estar na whitelist para interagir

---

### 2.2 Níveis de Acesso (hierarquia do sistema)

| Nível | O que pode fazer |
|---|---|
| `usuario` | Conversa, memória própria, lembretes próprios |
| `admin` | Tudo do usuário + ver/apagar memória de outros + gerenciar whitelist |
| `superadmin` | Tudo do admin + configurar o sistema, ver logs globais, promover/rebaixar usuários |

---

### 2.3 Perfis Funcionais (contexto de negócio)

Complementar aos níveis — define o *contexto* do usuário, não a permissão técnica. Útil para filtrar informações relevantes e, no futuro, segmentar dados do GLPI.

| Perfil | Contexto |
|---|---|
| `tecnico` | Foco operacional: atendimentos, configurações, senhas de equipamentos |
| `analista` | Foco analítico: processos, documentação, visão de múltiplos chamados |
| `coordenador` | Foco gerencial: equipe, SLAs, resumos consolidados |

---

### 2.4 Combinação dos dois eixos

```
Davi    → nivel: usuario    | perfil: tecnico
João    → nivel: usuario    | perfil: analista
Maria   → nivel: admin      | perfil: coordenador
Sistema → nivel: superadmin | perfil: —
```

O **nível** controla o que o usuário *pode fazer no sistema*. O **perfil** contextualiza *como o bot responde* e quais informações prioriza. São independentes — um técnico pode ser admin, um coordenador pode ser usuário comum.

---

## 3. Principais Funcionalidades

| # | Funcionalidade | Descrição |
|---|---|---|
| 1 | **Conversa livre** | Você fala como fala com uma pessoa; o bot entende contexto e intenção |
| 2 | **Histórico de sessão** | Mantém as últimas N mensagens em contexto — referências como "aquele chamado" funcionam |
| 3 | Memória persistente | Guarda notas, IPs, senhas temporárias, observações técnicas entre sessões |
| 4 | Recuperação de memória | Responde perguntas sobre o que foi salvo em qualquer momento |
| 5 | Lembretes | Agenda alertas por hora/data e notifica via WhatsApp |
| 6 | Resumo diário | Briefing matinal: lembretes + notas recentes do dia |
| 7 | *(futuro)* Consulta de chamados | Integração GLPI — lista chamados abertos, em andamento, por usuário |

---

## 4. Casos de Uso Centrais

1. **"Salva: servidor de backup IP 192.168.1.50, senha temporária Abc@2024"** → persiste em banco com contexto
2. **"Qual era a senha do servidor de backup?"** → recupera da memória persistente
3. **"Me lembra às 14h de reiniciar o servidor de logs"** → agenda e dispara no horário
4. **"Me dá um resumo do dia"** → lembretes do dia + notas salvas recentes
5. **"Tô com problema no AD, o usuário fulano não consegue logar"** → conversa livre, bot ajuda a pensar no diagnóstico
6. **"E aquela nota que salvei sobre o switch do 2º andar?"** → contexto de conversa + memória persistente combinados
7. *(futuro)* **"Quais chamados estão abertos hoje?"** → integração GLPI

---

## 5. Arquitetura Sugerida

```
WhatsApp ──► Evolution API (gateway) ──► Backend Node.js
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     ▼                        ▼                        ▼
              LLM Provider            PostgreSQL (memória       Redis (histórico
              (Groq/Ollama)           persistente + logs)       de sessão + scheduler)
              conversa + intenção            │                        │
                                            ▼                        ▼
                                     Memória por usuário      node-cron
                                     (notas, contexto)        dispara lembretes

  ──── futuro ────────────────────────────────────────────────────────────
              Integração GLPI (REST API) — consulta e abertura de chamados
```

### Componentes

| Componente | Tecnologia | Papel |
|---|---|---|
| **WhatsApp Gateway** | Evolution API (self-hosted) | Recebe/envia mensagens via WhatsApp |
| **Backend** | Node.js + Fastify | Orquestra fluxo, regras de negócio |
| **LLM** | Groq API (Llama 3.3 70B) via interface abstrata | Detecta intenção, mantém conversa, gera respostas |
| **Banco de dados** | PostgreSQL | Memória persistente, notas, logs |
| **Cache/Sessão** | Redis | Histórico de conversa por sessão, scheduler de lembretes |
| **Scheduler** | node-cron | Dispara lembretes no horário configurado |
| *(futuro)* **Tickets** | REST API GLPI | Consulta e abertura de chamados |

### Por que Evolution API?
- Self-hosted, gratuito, amplamente usado no Brasil
- Suporta múltiplos números, webhooks e API REST completa

### Estratégia de LLM — Provider Abstrato

O backend implementa uma interface `LLMProvider` com método único `chat(messages)`, permitindo trocar o modelo sem alterar o restante do código:

```
interface LLMProvider {
  chat(messages: Message[]): Promise<string>
}

GroqProvider       → Groq API (gratuito, Llama 3.3 70B — padrão do MVP)
OllamaProvider     → modelo local via Ollama (futuro, self-hosted, custo zero)
OpenRouterProvider → acesso a múltiplos modelos gratuitos (alternativa)
```

A variável `LLM_PROVIDER=groq|ollama|openrouter` no `.env` controla qual implementação é carregada em runtime.

**Groq (MVP):** Free tier com ~14.400 req/dia, latência muito baixa (LPU), Llama 3.3 70B.

**Ollama (futuro):** Roda modelos localmente (Llama 3, Mistral, Qwen). Custo zero, sem dependência externa, ideal para dados sensíveis. Requer mínimo de 8GB RAM para modelos 7B quantizados.

---

## 6. MVP — O que Entra

- Setup Docker Compose (Evolution API + backend + PostgreSQL + Redis)
- Conversa livre com histórico de sessão por usuário
- Módulo de memória persistente (salvar/recuperar notas, isolado por usuário)
- Módulo de lembretes (agendar + disparar via WhatsApp)
- Autenticação por whitelist de número + isolamento de contexto por usuário

**Fora do MVP:**
- Resumo diário automático
- Interface web de administração
- Integração GLPI
- Logs e auditoria avançada

---

## 7. Roadmap por Fases

### Fase 1 — MVP
- Setup Docker Compose (Evolution API + backend + PostgreSQL + Redis)
- Conversa livre com histórico de sessão por usuário
- Módulo de memória persistente (salvar/recuperar notas, isolado por usuário)
- Módulo de lembretes (agendar + disparar via WhatsApp)
- Autenticação por whitelist + isolamento de contexto por número

### Fase 2 — Consolidação
- Resumo diário automático (briefing matinal configurável)
- Melhorias de UX (formatação das respostas, confirmações)
- Logs de uso e histórico de conversas por usuário
- Tratamento de erros e fallbacks (LLM offline, timeout)

### Fase 3 — Expansão
- Integração GLPI (consulta de chamados, abertura via WhatsApp)
- Notificações proativas (chamado atualizado → avisa no WhatsApp)
- Interface web simples de admin (visualizar memória, lembretes, usuários)
- Suporte a modelo local via Ollama

---

## 8. Principais Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| **Bloqueio do número no WhatsApp** | Alto | Número dedicado + rate limiting cuidadoso na Evolution API |
| **Dados sensíveis na memória** | Alto | Criptografia em repouso (AES) + whitelist de usuários |
| **Limite de requisições do Groq** | Baixo | ~14.400 req/dia é suficiente para +5 usuários; fallback para Ollama local sem alterar código |
| **Crescimento desordenado da memória** | Médio | TTL configurável por tipo de nota + comando de limpeza manual |

---

## 9. Stack Final

```
Node.js 20 + Fastify
Evolution API (self-hosted via Docker)
PostgreSQL 16
Redis 7
Groq API — Llama 3.3 70B (gratuito, MVP)
Ollama — modelo local (futuro, via LLM_PROVIDER=ollama)
node-cron
Docker Compose
```
