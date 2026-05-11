# Deploy da VM em HTTP usando so o IP

Este guia e para o seu cenario atual:

- o Docker ja esta instalado na VM
- vamos usar HTTP, sem HTTPS
- voce quer acessar pelo IP da VM por enquanto
- nao vamos depender de DNS agora

Por isso, vamos usar os arquivos `docker-compose.local.yml` de:

- `traefik-proxy`
- `backend`
- `frontend`

## Visao geral

O fluxo correto e este:

1. clonar o repositorio na VM
2. descobrir o IP da VM
3. criar a rede `traefik-public`
4. subir o Traefik local
5. subir o backend local
6. rodar migrations e seed
7. subir o frontend local
8. testar no navegador usando `http://IP_DA_VM`

## 1. Clonar o repositorio na VM

```bash
cd /opt
sudo git clone <URL_DO_REPOSITORIO> progest
sudo chown -R $USER:$USER /opt/progest
cd /opt/progest
```

## 2. Descobrir o IP da VM

Rode:

```bash
hostname -I
```

Pegue o IP principal da VM. Exemplo:

```bash
export VM_IP=192.168.0.50
echo $VM_IP
```

Use esse valor em todos os passos abaixo.

## 3. Criar a rede do Traefik

```bash
docker network inspect traefik-public >/dev/null 2>&1 || docker network create traefik-public
```

## 4. Subir o Traefik local

O modo local do Traefik usa HTTP na porta `80`.

```bash
cd /opt/progest/traefik-proxy
docker compose -f docker-compose.local.yml up -d
docker compose -f docker-compose.local.yml ps
```

## 5. Configurar e subir o backend

Entre na pasta:

```bash
cd /opt/progest/backend
```

Crie o arquivo `backend/.env.docker.local` exatamente assim:

```bash
cat > .env.docker.local <<EOF
APP_NAME=Progest
APP_ENV=local
APP_KEY=base64:$(openssl rand -base64 32)
APP_DEBUG=true
APP_URL=http://${VM_IP}
FRONTEND_URL=http://${VM_IP}
APP_DOMAIN=${VM_IP}
API_DOMAIN=${VM_IP}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=progest
DB_USERNAME=progest
DB_PASSWORD=progest_secret

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
EOF
```

Suba o backend:

```bash
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml ps
```

Rode as migrations:

```bash
docker compose -f docker-compose.local.yml exec -T progest-api php artisan migrate --force
```

Popule o banco na primeira subida:

```bash
docker compose -f docker-compose.local.yml exec -T progest-api php artisan db:seed --force
```

Teste a API dentro da VM:

```bash
curl -H "Host: ${VM_IP}" http://127.0.0.1/api/health
```

Se quiser testar o login direto pela VM:

```bash
curl -H "Host: ${VM_IP}" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}' \
  http://127.0.0.1/api/login
```

## 6. Configurar e subir o frontend

Entre na pasta:

```bash
cd /opt/progest/frontend
```

Crie o arquivo `frontend/.env` exatamente assim:

```bash
cat > .env <<EOF
APP_DOMAIN=${VM_IP}
VITE_API_URL=http://${VM_IP}/api
EOF
```

Suba o frontend:

```bash
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml ps
```

Teste o frontend por dentro da VM:

```bash
curl -H "Host: ${VM_IP}" http://127.0.0.1
```

## 7. URL para testar

Abra no navegador:

```text
http://IP_DA_VM
```

Exemplo:

```text
http://192.168.0.50
```

A API deve responder em:

```text
http://IP_DA_VM/api/health
```

## 8. Login inicial

Se voce rodou o `db:seed --force`, o login inicial e:

- Email: `admin@admin.com`
- Senha: `admin`

## 9. Sequencia completa dos comandos da VM

Se voce quiser copiar a sequencia quase inteira de uma vez:

```bash
cd /opt
sudo git clone <URL_DO_REPOSITORIO> progest
sudo chown -R $USER:$USER /opt/progest
cd /opt/progest
export VM_IP=192.168.0.50
docker network inspect traefik-public >/dev/null 2>&1 || docker network create traefik-public

cd /opt/progest/traefik-proxy
docker compose -f docker-compose.local.yml up -d

cd /opt/progest/backend
cat > .env.docker.local <<EOF
APP_NAME=Progest
APP_ENV=local
APP_KEY=base64:$(openssl rand -base64 32)
APP_DEBUG=true
APP_URL=http://${VM_IP}
FRONTEND_URL=http://${VM_IP}
APP_DOMAIN=${VM_IP}
API_DOMAIN=${VM_IP}

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=progest
DB_USERNAME=progest
DB_PASSWORD=progest_secret

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120
EOF
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml exec -T progest-api php artisan migrate --force
docker compose -f docker-compose.local.yml exec -T progest-api php artisan db:seed --force

cd /opt/progest/frontend
cat > .env <<EOF
APP_DOMAIN=${VM_IP}
VITE_API_URL=http://${VM_IP}/api
EOF
docker compose -f docker-compose.local.yml up -d --build
```

## 10. Atualizar depois de um novo push

Quando voce atualizar o repositorio na VM:

```bash
cd /opt/progest
git pull

cd /opt/progest/backend
docker compose -f docker-compose.local.yml up -d --build
docker compose -f docker-compose.local.yml exec -T progest-api php artisan migrate --force

cd /opt/progest/frontend
docker compose -f docker-compose.local.yml up -d --build
```

## 11. Logs uteis

Traefik:

```bash
cd /opt/progest/traefik-proxy
docker compose -f docker-compose.local.yml logs -f
```

Backend:

```bash
cd /opt/progest/backend
docker compose -f docker-compose.local.yml logs -f progest-api
docker compose -f docker-compose.local.yml logs -f mysql
```

Frontend:

```bash
cd /opt/progest/frontend
docker compose -f docker-compose.local.yml logs -f progest-web
```

## 12. Observacoes importantes

- Neste modo, o sistema vai rodar em HTTP.
- O acesso sera direto por `http://IP_DA_VM`.
- O backend e o frontend compartilham o mesmo host, que nesse caso sera o proprio IP.
- A API fica em `http://IP_DA_VM/api`.
- O `db:seed --force` deve ser usado so na primeira subida de um banco vazio.
- Quando voce for migrar para DNS real e HTTPS, ai o ideal e trocar para os `docker-compose.yml` normais e nao mais os `.local`.
