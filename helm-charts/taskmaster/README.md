# TaskMaster Helm Chart

Helm chart for deploying TaskMaster AI to Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Docker images built and available locally

## Installation

### 1. Create Namespace

```bash
kubectl create namespace taskmaster
kubectl config set-context --current --namespace=taskmaster
```

### 2. Create Secrets

Create a Kubernetes secret with your sensitive configuration:

```bash
kubectl create secret generic taskmaster-secret \
  --from-literal=database-url="<your-neon-database-url>" \
  --from-literal=openai-api-key="<your-openai-api-key>" \
  --from-literal=jwt-secret="<your-jwt-secret>" \
  -n taskmaster
```

**Important**: Never commit secrets to Git. The secret.yaml template shows structure only.

### 3. Build Docker Images

```bash
# From repository root
docker build -t taskmaster-backend:1.0.0 ./backend
docker build -t taskmaster-frontend:1.0.0 ./frontend
```

### 4. Install Helm Chart

```bash
helm install taskmaster ./helm-charts/taskmaster -n taskmaster
```

## Configuration

The following table lists the configurable parameters of the TaskMaster chart and their default values.

### Backend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.replicaCount` | Number of backend replicas | `1` |
| `backend.image.repository` | Backend image repository | `taskmaster-backend` |
| `backend.image.tag` | Backend image tag | `1.0.0` |
| `backend.image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `backend.service.type` | Kubernetes service type | `ClusterIP` |
| `backend.service.port` | Backend service port | `8000` |
| `backend.resources.requests.cpu` | CPU request | `100m` |
| `backend.resources.requests.memory` | Memory request | `256Mi` |
| `backend.resources.limits.cpu` | CPU limit | `500m` |
| `backend.resources.limits.memory` | Memory limit | `512Mi` |

### Frontend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.replicaCount` | Number of frontend replicas | `1` |
| `frontend.image.repository` | Frontend image repository | `taskmaster-frontend` |
| `frontend.image.tag` | Frontend image tag | `1.0.0` |
| `frontend.image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `frontend.service.type` | Kubernetes service type | `LoadBalancer` |
| `frontend.service.port` | Frontend service port | `3000` |
| `frontend.resources.requests.cpu` | CPU request | `50m` |
| `frontend.resources.requests.memory` | Memory request | `128Mi` |
| `frontend.resources.limits.cpu` | CPU limit | `200m` |
| `frontend.resources.limits.memory` | Memory limit | `256Mi` |

### Configuration & Secrets

| Parameter | Description | Default |
|-----------|-------------|---------|
| `config.appEnv` | Application environment | `production` |
| `config.backendServiceUrl` | Backend service URL (internal) | `http://taskmaster-backend:8000` |
| `secret.name` | Name of the Kubernetes secret | `taskmaster-secret` |

## Custom Values

Create a custom values file to override defaults:

```yaml
# custom-values.yaml
backend:
  replicaCount: 2
  resources:
    requests:
      cpu: 200m
      memory: 512Mi

frontend:
  replicaCount: 2
```

Install with custom values:

```bash
helm install taskmaster ./helm-charts/taskmaster -f custom-values.yaml -n taskmaster
```

## Upgrading

To upgrade an existing release:

```bash
helm upgrade taskmaster ./helm-charts/taskmaster -n taskmaster
```

## Rollback

To rollback to a previous release:

```bash
# List releases
helm history taskmaster -n taskmaster

# Rollback to specific revision
helm rollback taskmaster <revision> -n taskmaster
```

## Uninstallation

To uninstall/delete the `taskmaster` deployment:

```bash
helm uninstall taskmaster -n taskmaster
```

This removes all Kubernetes components associated with the chart and deletes the release.

To also delete the namespace:

```bash
kubectl delete namespace taskmaster
```

## Troubleshooting

### Pods Not Starting

Check pod status and logs:

```bash
kubectl get pods -n taskmaster
kubectl describe pod <pod-name> -n taskmaster
kubectl logs <pod-name> -n taskmaster
```

### Image Pull Errors

Ensure images are built locally:

```bash
docker images | grep taskmaster
```

### Secret Not Found

Verify secret exists:

```bash
kubectl get secrets -n taskmaster
kubectl describe secret taskmaster-secret -n taskmaster
```

### Service Not Accessible

Check services:

```bash
kubectl get services -n taskmaster
kubectl describe service taskmaster-frontend -n taskmaster
```

For LoadBalancer type on Docker Desktop, the external IP will be `localhost`.

## Health Checks

Both backend and frontend have health probes configured:

- **Backend**: `GET /health` on port 8000
- **Frontend**: `GET /` on port 3000

Check probe status:

```bash
kubectl get pods -n taskmaster -o wide
```

## Scaling

Scale deployments horizontally:

```bash
# Scale backend
kubectl scale deployment taskmaster-backend --replicas=3 -n taskmaster

# Scale frontend
kubectl scale deployment taskmaster-frontend --replicas=2 -n taskmaster
```

Or update values.yaml and upgrade:

```yaml
backend:
  replicaCount: 3
frontend:
  replicaCount: 2
```

```bash
helm upgrade taskmaster ./helm-charts/taskmaster -n taskmaster
```

## Support

For issues and questions, please refer to the main project documentation or create an issue in the repository.
