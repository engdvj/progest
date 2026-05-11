# 🚦 Traefik Reverse Proxy - ProGest Infra

Este repositório contém a infraestrutura base do **Traefik**, o componente que gerencia todo o tráfego de entrada do servidor.

## ❓ Para que serve este repositório? (Resumo)
O Traefik atua como um **Proxy Reverso** (um "guarda de trânsito" digital). Ele é essencial por três motivos:
1.  **Roteamento por Domínio:** Decide para qual container (API ou Frontend) enviar a requisição baseado no domínio digitado (ex: `api.progest.local`).
2.  **Fim das Portas na URL:** Permite acessar vários sistemas no mesmo servidor sem precisar digitar portas como `:8080` ou `:3000`.
3.  **HTTPS Automático:** Gera e renova sozinho os certificados de segurança (Let's Encrypt) para todos os projetos.

---

## ⚙️ Configuração Dinâmica (.env)
Este repositório principal usa um arquivo `.env` especificamente para fornecer um e-mail de administrador para a segurança SSL (Let's Encrypt). O arquivo fica muito simples, crie na raiz da pasta `traefik-proxy`:

```env
ACME_EMAIL=seu-email-real@exemplo.com
```

*Nota: O domínio (APP_DOMAIN) não é declarado aqui no proxy, e sim nos `.env` das pastas de frontend e backend em si.*

---

## 🚀 Como Rodar Localmente

### Passo 1: Criar a Rede Pública
Todos os projetos devem estar na mesma rede virtual:
```bash
docker network create traefik-public
```

### Passo 2: Arquivo de Certificados (acme.json)
Crie o arquivo que guardará os certificados:
* **Windows (PowerShell):** `New-Item -ItemType File -Name "acme.json"`
* **Linux/Mac:** `touch acme.json && chmod 600 acme.json`

### Passo 3: Iniciar o Traefik Localmente
```bash
docker compose -f docker-compose.local.yml up -d
```

> **Dica Local:** Navegadores modernos redirecionam automaticamente qualquer domínio terminado em `.localhost` para sua própria máquina. **Não é necessário editar o arquivo hosts.**

---

## 🌍 Como Rodar em Produção

⚠️ **Atenção:** Em produção, você utilizará o ambiente real (`docker-compose.yml`) em vez do ambiente `.local`. Este ambiente de produção ativa o gerador Let's Encrypt para garantir o caderado verde (HTTPS).

1.  **DNS:** Aponte o domínio oficial (criando um registro tipo A) para o IP do servidor em sua registradora.
2.  **Variáveis:** No servidor, o arquivo `.env` da raiz do traefik deve conter o e-mail válido para o Let's Encrypt (`ACME_EMAIL=seu-email...`).
3.  **Portas:** Certifique-se de que as portas **80** e **443** estão abertas no firewall do seu host/servidor VPS.
4.  **Iniciar (Produção):** Na raiz deste repositório rode o comando oficial definitivo:
    ```bash
    docker compose up -d
    ```

---

## 🔌 Conectando Novos Projetos
Para conectar qualquer container, adicione a rede `traefik-public` como externa no `docker-compose.yml` do projeto e utilize as labels de roteamento referenciando o `${APP_DOMAIN}`.
