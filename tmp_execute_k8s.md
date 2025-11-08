# Executar K8s

## 1. Criar cluster com 3 workers

```shell
kind create cluster --name memory-game --config k8s/kind-config.yaml
```

## 2. Verificar nós

```shell
kubectl get nodes --show-labels
```

## 3. Build e carregar imagens

```shell
docker build -t memory-backend:latest ./backend
docker build -t memory-frontend:latest ./frontend
kind load docker-image memory-backend:latest --name memory-game
kind load docker-image memory-frontend:latest --name memory-game
```

## 4. Aplicar manifestos em ordem

```shell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-pvc.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

## 5. Verificar distribuição

```shell
kubectl get pods -n memory-game -o wide
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
