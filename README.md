# Kubernetes deployment (kind)

Este guia descreve como executar o projeto `memory-game` em um cluster Kubernetes local usando **kind**.

## Estrutura criada

```
kubernetes/
  kind/cluster.yaml
  frontend/{namespace.yaml,configmap.yaml,deployment.yaml,service.yaml}
  backend/{namespace.yaml,configmap.yaml,deployment.yaml,service.yaml}
  database/{namespace.yaml,configmap.yaml,pv.yaml,pvc.yaml,deployment.yaml,service.yaml}
```

## Pré-requisitos

- Docker instalado
- Kind instalado (`brew install kind`)
- kubectl instalado (`brew install kubectl`)

## 1. Criar cluster kind

```bash
kind create cluster --name memory-cluster --config kubernetes/kind/cluster.yaml
```

## 2. Build das imagens locais

Execute os builds das imagens usando os Dockerfiles existentes e marque-as com a tag `:local`.

```bash
# Backend
docker build -t memory-backend:local ./backend
# Frontend
docker build -t memory-frontend:local ./frontend
```

## 3. Carregar imagens no cluster kind

Kind não puxa imagens locais automaticamente, então é necessário carregar:

```bash
kind load docker-image memory-backend:local --name memory-cluster
kind load docker-image memory-frontend:local --name memory-cluster
```

## 4. Aplicar manifestos

Aplicar cada conjunto de manifestos. A ordem recomendada é: namespaces, database, backend, frontend.

```bash
kubectl apply -f kubernetes/database/namespace.yaml
kubectl apply -f kubernetes/database/pv.yaml
kubectl apply -f kubernetes/database/pvc.yaml
kubectl apply -f kubernetes/database/configmap.yaml
kubectl apply -f kubernetes/database/deployment.yaml
kubectl apply -f kubernetes/database/service.yaml

kubectl apply -f kubernetes/backend/namespace.yaml
kubectl apply -f kubernetes/backend/configmap.yaml
kubectl apply -f kubernetes/backend/deployment.yaml
kubectl apply -f kubernetes/backend/service.yaml

kubectl apply -f kubernetes/frontend/namespace.yaml
kubectl apply -f kubernetes/frontend/configmap.yaml
kubectl apply -f kubernetes/frontend/deployment.yaml
kubectl apply -f kubernetes/frontend/service.yaml
```

## 5. Verificar recursos

```bash
kubectl get pods -A
kubectl get svc -A
```

## 6. Acesso ao Serviço

Executar port-forward frontend:

```bash
kubectl -n frontend port-forward svc/frontend-svc 5173:5173
# Acessar em http://localhost:5173
```

Executar port-forward backend:

```bash
kubectl -n backend port-forward svc/backend-svc 8080:8080
curl http://localhost:8080/
```

## 7. Logs e Debug

```bash
kubectl -n backend logs -l app=memory-backend -f
kubectl -n frontend logs -l app=memory-frontend -f
kubectl -n database logs -l app=postgres -f
```

## 8. Remover cluster

```bash
kind delete cluster --name memory-cluster
```

## Observações

- O PV usa `hostPath` para simplicidade (somente para ambiente local). Em produção, usar StorageClass dinâmica.
- As variáveis sensíveis (ex: JWT_SECRET, credenciais DB) estão em ConfigMap por simplicidade; em produção use Secrets.
- O backend possui um initContainer que aguarda o Postgres estar pronto.

## Próximos passos sugeridos

- Migrar credenciais para Secrets.
- Adicionar HorizontalPodAutoscaler.
- Configurar Ingress para expor o frontend em vez de NodePort.
- Adicionar Job/CronJob para rodar migrações em vez de entrypoint dentro do container.
