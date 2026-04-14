---
name: Arquitetura Hexagonal
description: Ports & Adapters — separação entre domínio e infraestrutura
---

O domínio (regras de negócio) não depende de infraestrutura. Dependências externas entram por interfaces (ports); implementações concretas são adapters.

```
  [ Entrada — driving adapter ]
              ↓
     [ Core — domínio puro ]     ← sem imports de infra
        ↙           ↘
  [ Port A ]     [ Port B ]      ← interfaces definidas pelo domínio
      ↓               ↓
[ Adapter A ]   [ Adapter B ]    ← implementações concretas (infra, APIs, DBs)
```

**Regra central**: o core nunca importa infraestrutura diretamente. Sempre via interface. Trocar um adapter não afeta o domínio.
