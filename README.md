## Detalhes da API (Backend)

O backend está disponível por padrão em `http://localhost:8080` (quando o Compose está rodando).
Autenticação
- Todas as rotas autenticadas exigem o header:

  Authorization: Bearer <accessToken>
- O fluxo de autenticação usa access tokens (curta duração) e refresh tokens (rotacionados e persistidos no banco).

Endpoints principais
- POST /register
  - Descrição: cria um novo jogador.
  - Payload: { name: string, email: string, password: string }
- POST /login
  - Descrição: autentica e retorna tokens.
  - Payload: { email: string, password: string }
- POST /refresh
  - Descrição: troca (rotate) o refresh token por um novo refresh + access token.
  - Payload: { refreshToken: string }
- POST /logout
  - Descrição: revoga um refresh token (ou, quando chamado autenticado sem body, revoga todos do usuário).
  - Payload opcional: { refreshToken: string }
- GET /me
  - Descrição: retorna informações do jogador autenticado.
  - Retorno: { id, name, email }
- POST /game/save
  - Descrição: salva um jogo completado para o jogador autenticado.
  - Payload (exemplo): { moves: number, time_elapsed: number, score: number, level?: string }
- GET /ranking
  - Descrição: retorna ranking agregado por jogador (top score e melhor tempo).

Exemplos (curl)
Registrar e logar:

```bash
curl -s -X POST http://localhost:8080/register \
curl -s -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}' | jq
Salvar um jogo (exemplo):

```bash
ACCESS_TOKEN=<access token aqui>
curl -s -X POST http://localhost:8080/game/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
Observações
- As seeds inicializam dois usuários de teste: `alice@example.com` / `password123` e `bob@example.com` / `secret456`.
- Verifique `backend/.env.example` para variáveis de ambiente relevantes (DB, JWT secret, etc.).

## Como contribuir
Por favor, siga estes passos para contribuir com o projeto:

1. Fork do repositório e clone para sua máquina.

2. Crie uma branch para sua feature/bugfix:
```bash
git checkout -b feat/minha-feature
```

3. Instale dependências e rode localmente (opcional - backend):
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

4. Faça commits pequenos e descritivos. Exemplo de convenção simples:
```
feat: adicionar endpoint de exemplo
fix: corrigir validação do login
docs: atualizar README
```

5. Abra um Pull Request contra a branch `main` do repositório original. No PR, descreva a mudança, como testá-la e inclua capturas de tela se houver alteração visual.

6. Após revisão, ajustes e aprovação, faremos o merge.

Observações para mantenedores
- Execute as migrations e seeds antes de revisar alterações que dependam do esquema do banco.
- Se adicionar novas variáveis de ambiente, atualize `backend/.env.example`.

## Release / Publicação de imagem Docker (CI/CD)
Ao criar uma release/tag o workflow de CI irá construir e publicar uma imagem Docker no Docker Hub.

Onde está a workflow
- O workflow do GitHub Actions está em `backend/.github/workflows/docker-publish.yml`.

Secrets necessários no repositório (GitHub Settings → Secrets):
- `DOCKERHUB_USERNAME` — seu usuário no Docker Hub.
- `DOCKERHUB_TOKEN` — token (ou senha) do Docker Hub. Recomenda-se criar um Access Token.
- `DOCKERHUB_REPO` — (opcional) nome completo do repositório, por exemplo `meuuser/memory-backend`. Se omitido, o workflow usa `DOCKERHUB_USERNAME/memory-backend`.

Como criar uma release / tag que dispara o publish
1. Atualize a versão do backend em `backend/package.json` (por exemplo, "version": "1.0.1").

2. Commit e crie uma tag com o prefixo `v` (o workflow reage a tags `v*`):

```bash
git add backend/package.json
git commit -m "chore(release): 1.0.1"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

3. O GitHub Actions irá rodar o workflow `backend/.github/workflows/docker-publish.yml`, que irá:
  - ler a versão em `backend/package.json` (fallback para usar `DOCKERHUB_REPO` ou `DOCKERHUB_USERNAME/memory-backend` como nome de imagem),
  - construir a imagem multi-arch,
  - publicar tags: `<image>:<version>`, `<image>:latest` e `<image>:<short-sha>`.

Alternativa: você pode disparar manualmente o workflow via GitHub Actions UI (workflow_dispatch).

Como testar a imagem publicada (após o workflow completar):

```bash
docker pull <your-docker-repo>:1.0.1
docker run -e DATABASE_URL=... -p 8080:8080 <your-docker-repo>:1.0.1
```

Substitua `<your-docker-repo>` pelo valor de `DOCKERHUB_REPO` ou `DOCKERHUB_USERNAME/memory-backend`.

---

Se quiser, eu posso também:
- Atualizar o workflow para usar diretamente a tag git (ao invés de `backend/package.json`) para decidir a versão do build.
- Adicionar um badge no README com a imagem e a última tag publicada.

Ficou claro? Quer que eu já atualize o README do `backend/README.md` também com um resumo mais técnico (variáveis de ambiente, comandos para migrar, etc.)?
# Memory Game (React + Fastify + PostgreSQL) — Docker Compose

This repository contains a Memory Game full-stack example (frontend React + Vite + Tailwind, backend Node.js + Fastify, PostgreSQL) meant to run with Docker Compose.

Quick overview
- Backend: Fastify, Knex, PostgreSQL, JWT auth (access + refresh tokens, refresh token rotation persisted to DB).
- Frontend: Vite + React + Tailwind, axios with automatic token refresh, protected routes and simple memory game UI.
- DB: PostgreSQL; migrations and seeds run on container startup.

Prerequisites
- Docker & Docker Compose installed

Run with Docker Compose (recommended)

1. From the project root, build and start all services:

```bash
docker compose up --build -d
```

2. Confirm services are running:

```bash
docker compose ps
```

3. Backend API will be available at http://localhost:8080
4. Frontend will be available at http://localhost:5173

Environment & configuration
- The backend reads configuration from environment variables; the development default values are in `backend/.env.example`. When running with Docker Compose, the compose file sets sensible defaults.

API (basic)
- POST /register — register a new player (name, email, password)
- POST /login — login and receive { accessToken, refreshToken }
- POST /refresh — rotate refresh token and return new accessToken
- POST /logout — revoke refresh token
- GET /me — fetch authenticated player info
- POST /game/save — save completed game (authenticated)
- GET /ranking — global ranking by score

Testing flows
- You can register a new account via the frontend or via curl to the backend.

Example — register then login (curl):

```bash
curl -s -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret"}'

curl -s -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret"}' | jq
```

Notes and next steps
- For production, consider storing refresh tokens in HttpOnly secure cookies instead of localStorage.
- Add automated tests (integration + unit) and CI pipeline.

If you'd like, I can:
- Rebuild and verify the Docker Compose services now and share the container status/logs.
- Add more API examples or curl snippets for each endpoint.

--
Generated README (concise). If you want a more detailed README with architecture diagrams, environment variable docs, or deployment notes, tell me which sections to expand.
# Memory Game (Jogo da Memória)

Projeto fullstack: frontend React + Vite + Tailwind, backend Node.js + Fastify + Knex e PostgreSQL. Tudo orquestrado com Docker Compose.

Endpoints principais:
- POST /register
- POST /login
- POST /refresh
- GET /me
- POST /game/save
- GET /ranking

Ports:
- Frontend: 5173
- Backend: 8080
- Postgres: 5432

Como rodar:

1. Copie variáveis para `.env` (veja `backend/.env.example`).
2. Execute:

```bash
docker compose up --build
```

Abra `http://localhost:5173` para usar o jogo.

Notas importantes:
- O backend aplica migrações e seeds automaticamente ao iniciar (via `entrypoint.sh`). As seeds criam dois usuários de teste: `alice@example.com` / `password123` e `bob@example.com` / `secret456`.
- O sistema usa refresh tokens persistidos no banco. Ao fazer login, o `refreshToken` é salvo no banco e pode ser revogado via `POST /logout`.

Comandos úteis:

```bash
# Parar e remover containers (preserva volume pgdata):
docker compose down

# Subir em foreground e ver logs:
docker compose up --build

# Subir em background:
docker compose up --build -d
docker compose logs -f memory_backend
```
