# Memory Game Application

A full-stack memory game application with React frontend, Node.js backend, and PostgreSQL database. Designed for both Docker Compose and Kubernetes deployment.

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Fastify + Knex.js
- **Database**: PostgreSQL
- **Authentication**: JWT with access/refresh token rotation
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes ready

## 📁 Project Structure

```text
memory-game/
├── backend/                 # Backend service (Node.js + Fastify)
├── frontend/               # Frontend service (React + Vite)
├── k8s/                   # Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── postgres-*.yaml    # PostgreSQL resources
│   ├── backend-*.yaml     # Backend resources
│   └── frontend-*.yaml    # Frontend resources
├── docker-compose.yml     # Local development setup
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- For Kubernetes: kubectl and a K8s cluster (e.g., Kind, Minikube)

### Local Development (Docker Compose)

1. **Start all services**:

   ```bash
   docker-compose up --build
   ```

2. **Access the application**:

   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:8080>
   - Database: localhost:5432

3. **Default test users**:
   - `alice@example.com` / `password123`
   - `bob@example.com` / `secret456`

### Kubernetes Deployment

1. **Deploy infrastructure**:

   ```bash
   kubectl apply -f k8s/namespace.yaml
   kubectl apply -f k8s/configmap.yaml
   kubectl apply -f k8s/secret.yaml
   ```

2. **Deploy PostgreSQL**:

   ```bash
   kubectl apply -f k8s/postgres-pvc.yaml
   kubectl apply -f k8s/postgres-deployment.yaml
   kubectl apply -f k8s/postgres-service.yaml
   ```

3. **Deploy application services**:

   ```bash
   kubectl apply -f k8s/backend-deployment.yaml
   kubectl apply -f k8s/backend-service.yaml
   kubectl apply -f k8s/frontend-deployment.yaml
   kubectl apply -f k8s/frontend-service.yaml
   ```

## 🔐 API Reference

Base URL: `http://localhost:8080`

### Authentication

All protected routes require: `Authorization: Bearer <accessToken>`

### Endpoints

| Method | Endpoint     | Description          | Auth Required |
| ------ | ------------ | -------------------- | ------------- |
| POST   | `/register`  | Create new player    | ❌            |
| POST   | `/login`     | Authenticate user    | ❌            |
| POST   | `/refresh`   | Rotate refresh token | ❌            |
| POST   | `/logout`    | Revoke refresh token | ❌            |
| GET    | `/me`        | Get player info      | ✅            |
| POST   | `/game/save` | Save game result     | ✅            |
| GET    | `/ranking`   | Get global ranking   | ❌            |

### Example Usage

**Register a new user**:

```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

**Login**:

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

**Save game result**:

```bash
curl -X POST http://localhost:8080/game/save \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -d '{"moves":15,"time_elapsed":120,"score":850,"level":"easy"}'
```

## 🔧 Development

### Backend Development

```bash
cd backend
npm install
npm run migrate    # Run database migrations
npm run seed      # Seed test data
npm run dev       # Start development server
```

### Environment Configuration

Copy `backend/.env.example` to `backend/.env` and adjust variables as needed.

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `JWT_ACCESS_EXPIRES_IN`: Access token expiration
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration

## 🚢 CI/CD & Docker Publishing

The project includes GitHub Actions workflow for automated Docker image publishing.

### Required GitHub Secrets

- `DOCKERHUB_USERNAME`: Docker Hub username
- `DOCKERHUB_TOKEN`: Docker Hub access token
- `DOCKERHUB_REPO`: Repository name (optional)

### Creating a Release

1. **Update version**:

   ```bash
   # Update version in backend/package.json
   git add backend/package.json
   git commit -m "chore(release): 1.0.1"
   ```

2. **Create and push tag**:

   ```bash
   git tag v1.0.1
   git push origin main
   git push origin v1.0.1
   ```

3. **Automated build**: GitHub Actions will build and push multi-arch Docker images with tags:
   - `<repo>:<version>`
   - `<repo>:latest`
   - `<repo>:<short-sha>`

## 🤝 Contributing

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feat/amazing-feature`
3. **Make your changes** with clear, descriptive commits
4. **Test thoroughly** (local Docker Compose setup)
5. **Submit a Pull Request** with detailed description

### Commit Convention

```text
feat: add new endpoint
fix: resolve login validation
docs: update API documentation
chore: update dependencies
```

## 🛠️ Useful Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up --build

# Kubernetes logs
kubectl logs -f deployment/backend -n memory-game
kubectl logs -f deployment/frontend -n memory-game
```

## 📝 License

This project is licensed under the MIT License.

---

**Need help?** Check the issues page or create a new issue for questions and bug reports.
