---
name: Limites de tamanho de arquivo
description: Limites máximos de linhas por tipo de arquivo — bloqueado pelo hook check-file-size.js
type: project
---

| Padrão | Limite |
|---|---|
| `*.route.ts`, `*.handler.ts` | 100 linhas |
| `*.provider.ts` | 150 linhas |
| `*.service.ts` | 200 linhas |
| `*.module.ts` | 80 linhas |
| `*.test.ts` | 350 linhas |
| demais `*.ts` / `*.js` | 250 linhas |

Se um arquivo ultrapassar o limite, propor extração de módulos antes de editar. Usar `/refactor`.
