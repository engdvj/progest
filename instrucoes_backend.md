🐳 Forma 2: Rodando com Docker (Ambiente Isolado)

Ideal para simular o ambiente de produção com domínios reais e Proxy Reverso.

Pré-requisitos: Docker Desktop e o repositório traefik-proxy rodando.
Passo a Passo

    Rede: Garanta que a rede pública existe rodando: docker network create traefik-public.
    Variáveis: Crie suas próprias cópias de ambiente baseadas nos .example:
        Copie .env.docker.example para .env.docker.local (este será consumido pelo Docker Desktop).
        (O .env normal e .env.example servem apenas para o uso por fora do Docker/XAMPP).
    Ajuste as definições: No .env.docker.local (Local) certifique-se que as seguintes variáveis estejam ajustadas para dev:

    APP_ENV=local
    APP_DEBUG=true
    APP_DOMAIN=app.localhost
    DB_HOST=mysql
    DB_DATABASE=progest
    DB_USERNAME=progest
    DB_PASSWORD=progest_secret

    Adicione a APP_KEY: O arquivo .env.docker.local precisa referenciar uma chave de criptografia na variável APP_KEY=.
        Se você tem PHP na máquina (via XAMPP): rode php artisan key:generate --show no terminal, copie o resultado e cole no arquivo.
        Se NÃO tem PHP: deixe em branco por enquanto. Após executar o passo 5 (subir containers), rode o comando docker compose -f docker-compose.local.yml exec progest-api php artisan key:generate --show, copie o valor resultante e cole no seu .env.docker.local. Por fim, repita o comando do passo 5 para aplicar a nova chave aos containers.
    Suba os containers localmente:

docker compose -f docker-compose.local.yml up -d --build

    Prepare o Banco:

docker compose -f docker-compose.local.yml exec progest-api php artisan migrate
docker compose -f docker-compose.local.yml exec progest-api php artisan db:seed

🚨 Possíveis Erros e Como Resolver
❌ Erro: it is missing from your system. Install or enable PHP's gd/zip extension.

    Causa: O Composer tentou instalar pacotes de Excel, mas as extensões gd ou zip estão desativadas no seu php.ini.
    Solução: Siga a seção "Configuração Obrigatória do PHP" no início deste README, habilite as extensões e reinicie o terminal.

❌ Erro: SQLSTATE[HY000] [1049] Unknown database 'progest'

    Causa: O banco de dados físico ainda não foi criado no MySQL.
    Solução: Acesse o phpMyAdmin ou Workbench e crie manualmente um banco de dados vazio chamado progest.

❌ Erro: SQLSTATE[HY000]: General error: 1419 You do not have the SUPER privilege

    Causa: O MySQL bloqueia a criação de Triggers (usadas no estoque) por segurança.
    Solução: No seu docker-compose.yml, o serviço mysql deve conter a linha: command: --log-bin-trust-function-creators=1.

❌ Erro: file_get_contents(.env): Failed to open stream

    Causa: O comando key:generate não encontrou o arquivo .env dentro do container.
    Solução: Verifique se o seu .dockerignore permite o arquivo .env ou crie-o manualmente: docker compose exec progest-api touch .env.

❌ Erro: it is missing from your system (ext-gd) no Docker build

    Causa: O Composer checa extensões antes de instalar.
    Solução: No Dockerfile, use: RUN composer install --ignore-platform-reqs.

Guia de Deploy Online (Após adquirir domínio)

Assim que você tiver o seu domínio oficial (ex: sistema-hospital.com.br), siga este roteiro final para Publicação Definitiva:

    DNS: Acesse o painel de onde comprou o domínio (Registro.br, Cloudflare) e crie um apontamento DNS do tipo A apontando o seu domínio sem o 'api' diretamente para o IP do seu servidor/VPS.
    SSL Config: No arquivo docker-compose.yml do Traefik, altere o valor do e-mail que está como --certificatesresolvers.myresolver.acme.email=... para um endereço de e-mail seu, isso permitirá ao Let's Encrypt gerenciar o cadeadinho verde (HTTPS).
    Variável de Produção: Em cada um dos seus ambientes (backend-progest e frontend-progest), no servidor, certifique-se de que o .env (Frontend) e o .env.docker.production (Backend) possuem a variável:

    APP_DOMAIN=sistema-hospital.com.br

    Comando Final (Produção): No terminal do seu Servidor VPS, navegue até cada uma das pastas (1. traefik-proxy, 2. backend-progest, 3. frontend-progest) e rode consecutivamente:

    docker compose up -d --build

        ⚠️ Aviso Importante: Repare que o comando de Produção acima NÃO USA a flag -f docker-compose.local.yml. Ao omitir o arquivo, o Docker lerá os docker-compose.yml originais das pastas, que ativam todo o sistema Let's Encrypt de segurança de produção. O Traefik cuidará do cadeado, e magicamente o banco de dados e as rotas serão ativadas no seu domínio. (A API ficará automaticamente roteada na camada oculta de segurança no diretório /api sob o mesmo domínio do sistema)

