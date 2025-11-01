# Memory-frontend

Este diretório contém o frontend do jogo (Vite + React + Tailwind).

Resumo rápido
- App: React + Vite
- Porta de preview (preview): 5173
- A imagem Docker pública disponibilizada (opcional) está em: `iagobcosta/memory-game-ui:1.0.0`

Como rodar localmente (desenvolvimento)

1. Instale dependências:

```bash
npm install
```

2. Rode em modo dev (Vite):

```bash
npm run dev
```

3. Build de produção e preview:

```bash
npm run build
npm run preview
```

Usando o Docker Compose (subir backend + frontend + db)

```yaml
services:
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=memory_user
      - POSTGRES_PASSWORD=memory_pass
      - POSTGRES_DB=memory_game
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    image: iagobcosta/memory-game-api:1.0.0
    environment:
      - DATABASE_URL=postgres://memory_user:memory_pass@db:5432/memory_game
      - JWT_SECRET=supersecretkey
    ports:
      - "8080:8080"

  frontend:
    image: iagobcosta/memory-game-ui:1.0.0
    environment:
      - VITE_BACKEND_URL=http://backend:8080
    ports:
      - "5173:5173"

volumes:
  pgdata:

```

Para subir tudo via Docker Compose (a partir da raiz do projeto):

```bash
docker compose up -d
```

Contribuindo com o frontend

Siga estas instruções para contribuir com o frontend:

1. Fork e clone o repositório.

2. Crie uma branch de trabalho:

```bash
git checkout -b feat/minha-feature-frontend
```

3. Instale dependências e rode localmente (dev):

```bash
cd frontend
npm install
npm run dev
```

4. Faça commits pequenos e descritivos. Ex.:

```
feat(frontend): adicionar animação de flip
fix(frontend): corrigir bug de timer
docs(frontend): atualizar README
```

5. Abra um Pull Request contra `main` no repositório original. Inclua descrição do que muda e como testar.

Dicas e notas
- Se o frontend não estiver apontando para o backend correto, ajuste `VITE_BACKEND_URL` no arquivo `.env` ou nas variáveis de ambiente do Compose.

Obrigado por contribuir — qualquer dúvida, abra uma issue ou chame no PR.
