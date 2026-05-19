# Cloud Native URL Shortener - DevOps Guide

Complete DevOps setup covering Docker, Kubernetes (Minikube), CI/CD (GitHub Actions + DockerHub), and monitoring (Prometheus + Grafana).

> **Architecture:** Minikube is used for local Kubernetes orchestration demos. AWS EC2 deployment uses Docker Compose. DockerHub is the container registry.

---

## Project Structure

```
├── .github/workflows/
│   └── ci-cd.yml                    # GitHub Actions → DockerHub → Deploy
├── .env.example                     # Docker Compose env vars template
├── docker-compose.yml               # EC2 deployment (all 5 services)
├── backend/
│   ├── Dockerfile                   # Multi-stage Node.js image
│   └── .env.example                 # Backend env vars (service names, no localhost)
├── frontend/
│   ├── Dockerfile                   # Multi-stage: Vite build → Nginx
│   ├── nginx.conf                   # Template with ${BACKEND_HOST} variable
│   └── docker-entrypoint.sh         # Runtime env injection
├── devops/
│   ├── k8s/
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml           # Service names, no localhost
│   │   ├── secrets.yaml
│   │   ├── mongodb.yaml
│   │   ├── backend.yaml             # DockerHub image
│   │   ├── frontend.yaml            # DockerHub image + env vars
│   │   └── ingress.yaml
│   └── monitoring/
│       ├── prometheus.yml            # Scrapes service names, no localhost
│       └── grafana/provisioning/
│           ├── datasources/
│           └── dashboards/json/
```

---

## 1. Docker Compose — AWS EC2 Deployment

### Setup

```bash
# Copy environment config
cp .env.example .env

# Edit .env with your values:
#   DOCKERHUB_USERNAME=yourusername
#   PUBLIC_URL=http://your-ec2-public-ip
#   TAG=latest
nano .env

# Pull and start all services
docker compose pull
docker compose up -d

# Verify
docker compose ps
docker compose logs -f
```

### Service Access (on EC2)

| Service      | URL                                  |
|-------------|---------------------------------------|
| Frontend    | `http://<ec2-public-ip>`             |
| Backend API | `http://<ec2-public-ip>:5000`        |
| Prometheus  | `http://<ec2-public-ip>:9090`        |
| Grafana     | `http://<ec2-public-ip>:3000`        |

### Key Design Decisions

- **No localhost references**: All services communicate using Docker service names (`backend`, `mongodb`, `prometheus`)
- **Runtime config**: Frontend API URL is injected at container startup, not baked at build time
- **DockerHub images**: `docker compose pull` fetches latest images without rebuilding

---

## 2. Kubernetes — Minikube (Local Demo)

> ⚠️ This is for **local orchestration demo only**. Not for cloud K8s (no EKS/GKE/AKS).

### Prerequisites

```bash
minikube start
minikube addons enable ingress
```

### Update Image References

Edit `devops/k8s/backend.yaml` and `devops/k8s/frontend.yaml` to use your DockerHub username:

```yaml
image: yourdockerhubusername/cloudlink-backend:latest
image: yourdockerhubusername/cloudlink-frontend:latest
```

### Deploy

```bash
kubectl apply -f devops/k8s/namespace.yaml
kubectl apply -f devops/k8s/configmap.yaml
kubectl apply -f devops/k8s/secrets.yaml
kubectl apply -f devops/k8s/mongodb.yaml
kubectl apply -f devops/k8s/backend.yaml
kubectl apply -f devops/k8s/frontend.yaml
kubectl apply -f devops/k8s/ingress.yaml
```

### Access the App

```bash
# Add to hosts file
echo "$(minikube ip) cloudlink.local" | sudo tee -a /etc/hosts

# Open
open http://cloudlink.local
```

### Verify

```bash
kubectl get all -n cloudlink
kubectl get ingress -n cloudlink
kubectl logs -f deployment/backend -n cloudlink
```

---

## 3. CI/CD — GitHub Actions + DockerHub

### Required GitHub Secrets

| Secret              | Description                    |
|--------------------|--------------------------------|
| `DOCKERHUB_USERNAME` | Your DockerHub username        |
| `DOCKERHUB_TOKEN`    | DockerHub access token         |

### Pipeline Stages

| Stage           | Trigger                          | What it does                              |
|----------------|----------------------------------|-------------------------------------------|
| **Test**       | Push & PR to `main`              | Install deps, lint, test with MongoDB     |
| **Build & Push** | Push to `main` or version tag  | Build images, push to DockerHub           |
| **Deploy**     | Push to `main`                   | Simulate EC2 + Minikube deployment steps  |

### Image Tagging

Images are tagged automatically:
- `latest` — on pushes to `main`
- `main` — branch name tag
- `<sha>` — git commit SHA
- `v1.0.0` — when you push a version tag like `git tag v1.0.0`

---

## 4. Monitoring

### Prometheus

- Scrapes `backend:5000/metrics` every 10 seconds (Docker service name)
- Self-monitoring via `prometheus:9090`
- Custom metrics: `http_requests_total`, `http_request_duration_seconds`

### Grafana

- **Credentials:** `admin` / `admin` (configurable via `.env`)
- Auto-provisioned Prometheus datasource
- Auto-provisioned dashboard with 7 panels:
  - Total HTTP requests
  - Request rate (req/s)
  - Status code breakdown
  - Latency percentiles (p50/p95/p99)
  - CPU usage
  - Heap memory
  - Active handles

---

## Environment Variable Reference

### Backend

| Variable     | Description                    | Example                              |
|-------------|--------------------------------|--------------------------------------|
| `PORT`      | Server port                    | `5000`                               |
| `MONGO_URI` | MongoDB connection string      | `mongodb://mongodb:27017/url-shortener` |
| `BASE_URL`  | Public URL for short links     | `http://cloudlink.local`             |
| `NODE_ENV`  | Environment mode               | `production`                         |

### Frontend (Container Runtime)

| Variable       | Description                    | Example                  |
|---------------|--------------------------------|--------------------------|
| `BACKEND_HOST` | Backend service hostname       | `backend` / `backend-service` |
| `BACKEND_PORT` | Backend service port           | `5000`                   |
| `API_BASE_URL` | API path for React app         | `/api`                   |
| `BASE_URL`     | Public URL for short link display | `http://cloudlink.local` |

---

## Quick Reference

```bash
# EC2: Full stack
docker compose pull && docker compose up -d

# EC2: Tear down
docker compose down

# EC2: Rebuild locally
docker compose up -d --build

# Minikube: Apply all
kubectl apply -f devops/k8s/

# Minikube: Delete all
kubectl delete namespace cloudlink
```
