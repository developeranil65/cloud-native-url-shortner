# CloudLink – Cloud Native URL Shortener: Complete Project Documentation

> **Instructions for Word conversion:** Feed this entire file to Claude with the prompt:
> *"Convert this markdown file into a professionally formatted Word document. Use proper headings, styles, and preserve the structure. Replace all `[SCREENSHOT: ...]` placeholders with the actual images I will provide."*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Application Architecture](#2-application-architecture)
3. [Backend – Node.js API](#3-backend--nodejs-api)
4. [Frontend – React Application](#4-frontend--react-application)
5. [Containerization with Docker](#5-containerization-with-docker)
6. [Local Development with Docker Compose](#6-local-development-with-docker-compose)
7. [Publishing Images to DockerHub](#7-publishing-images-to-dockerhub)
8. [AWS Infrastructure with Terraform](#8-aws-infrastructure-with-terraform)
9. [CI/CD Pipeline with GitHub Actions](#9-cicd-pipeline-with-github-actions)
10. [Kubernetes Deployment with Minikube](#10-kubernetes-deployment-with-minikube)
11. [Monitoring with Prometheus and Grafana](#11-monitoring-with-prometheus-and-grafana)
12. [Final Verification](#12-final-verification)

---

## 1. Project Overview

**CloudLink** is a full-stack, cloud-native URL shortener application built to demonstrate modern DevOps practices. The project covers the entire software lifecycle — from writing application code to deploying it on cloud infrastructure with automated pipelines and observability tooling.

### What the Application Does

- Accepts a long URL as input and returns a short, shareable link.
- Redirects users from the short link to the original URL.
- Tracks URL creation and redirect counts.
- Exposes metrics for monitoring via a `/metrics` endpoint.

### Technologies Used

| Layer | Technology |
|---|---|
| Backend API | Node.js + Express |
| Frontend | React (Vite) + Nginx |
| Database | MongoDB |
| Containerization | Docker + Docker Compose |
| Container Registry | DockerHub |
| Cloud Infrastructure | AWS EC2 + Elastic IP |
| Infrastructure as Code | Terraform |
| CI/CD Pipeline | GitHub Actions |
| Container Orchestration | Kubernetes (Minikube) |
| Monitoring | Prometheus + Grafana |

[SCREENSHOT: Final application running in the browser showing the URL shortener interface]

---

## 2. Application Architecture

The application follows a microservices-inspired, three-tier architecture:

```
Internet
    │
    ▼
┌──────────────┐
│   Frontend   │  React + Nginx (Port 80)
│   (Nginx)    │  Serves static files + proxies /api → backend
└──────┬───────┘
       │ /api/*
       ▼
┌──────────────┐
│   Backend    │  Node.js + Express (Port 5000)
│   (API)      │  Handles URL logic, exposes /health and /metrics
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   MongoDB    │  Persistent storage (Port 27017)
│   Database   │  Stores URL mappings
└──────────────┘

┌──────────────┐    scrapes /metrics
│  Prometheus  │ ◄─────────────────── Backend
│  (Port 9090) │
└──────┬───────┘
       │ data source
       ▼
┌──────────────┐
│   Grafana    │  Dashboards (Port 3000)
└──────────────┘
```

### Repository Structure

```
cloud-native-url-shortner/
├── backend/                    # Node.js Express API
│   ├── server.js
│   ├── app.js
│   ├── config/db.js
│   ├── routes/
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # React application
│   ├── src/
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── devops/
│   ├── k8s/                    # Kubernetes manifests
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secrets.yaml
│   │   ├── mongodb.yaml
│   │   ├── backend.yaml
│   │   ├── frontend.yaml
│   │   ├── ingress.yaml
│   │   ├── prometheus.yaml
│   │   └── grafana.yaml
│   └── monitoring/             # Monitoring configuration
│       ├── prometheus.yml
│       └── grafana/
│           └── provisioning/
│               ├── datasources/datasource.yml
│               └── dashboards/
├── terraform/                  # AWS Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── terraform.tfvars
│   └── user-data.sh
└── .github/
    └── workflows/
        └── ci-cd.yml           # GitHub Actions pipeline
```

[SCREENSHOT: GitHub repository showing the complete folder structure]

---

## 3. Backend – Node.js API

### Overview

The backend is a RESTful API built with **Node.js** and **Express**. It connects to MongoDB to store and retrieve URL mappings, and uses the `prom-client` library to expose Prometheus-compatible metrics.

### Key Files

**`backend/server.js`** — Entry point, starts the HTTP server.

**`backend/app.js`** — Express app setup with routes and middleware.

**`backend/config/db.js`** — MongoDB connection logic using Mongoose.

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/shorten` | Create a short URL |
| `GET` | `/:code` | Redirect to original URL |
| `GET` | `/api/urls` | List all URLs |
| `GET` | `/health` | Health check (returns `{ status: "ok" }`) |
| `GET` | `/metrics` | Prometheus metrics endpoint |

### Health Check

The `/health` endpoint is critical for Docker and Kubernetes health probes. It returns:

```json
{ "status": "ok", "timestamp": "2026-05-19T..." }
```

### Metrics

The backend uses `prom-client` to expose:
- `http_requests_total` — Total HTTP requests by method, route, and status code
- `http_request_duration_seconds` — Request latency histogram
- `nodejs_heap_size_used_bytes` — Node.js memory usage
- `process_cpu_user_seconds_total` — CPU usage

[SCREENSHOT: Browser showing `http://<ip>:5000/health` returning `{"status":"ok"}`]

[SCREENSHOT: Browser showing `http://<ip>:5000/metrics` with Prometheus metrics output]

---

## 4. Frontend – React Application

### Overview

The frontend is a React application built with Vite, served by **Nginx** in production. Nginx acts as both a static file server and a reverse proxy — forwarding all `/api/*` requests to the backend service.

### Nginx Configuration

The `nginx.conf` file defines proxy rules:

```nginx
location /api/ {
    proxy_pass http://backend:5000/api/;
}
```

This means the browser only talks to port 80 (Nginx) — there are no direct cross-origin calls to port 5000.

[SCREENSHOT: The CloudLink frontend in the browser — homepage with URL shortener input form]

[SCREENSHOT: After submitting a long URL — the short URL result is displayed]

[SCREENSHOT: Clicking the short URL — browser redirects to the original long URL]

---

## 5. Containerization with Docker

Both the backend and frontend are containerized using **multi-stage Docker builds** to minimize final image size.

### Backend Dockerfile

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Frontend Dockerfile

```dockerfile
# Stage 1: Build React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Building Images Locally

```bash
# Build backend
docker build -t cloudlink-backend ./backend

# Build frontend
docker build -t cloudlink-frontend ./frontend

# Verify images were created
docker images
```

[SCREENSHOT: Terminal showing `docker images` with cloudlink-backend and cloudlink-frontend listed]

---

## 6. Local Development with Docker Compose

For local development, all services are started together using **Docker Compose**.

### docker-compose.yml

```yaml
services:
  frontend:
    image: cloudlink-frontend
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy

  backend:
    image: cloudlink-backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/url-shortener
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:5000/health"]
      interval: 15s
      retries: 5

  mongodb:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      retries: 5
```

### Running Locally

```bash
docker compose up -d
docker compose ps
```

[SCREENSHOT: Terminal showing `docker compose ps` with all services running and healthy]

[SCREENSHOT: Browser showing the app running at `http://localhost`]

---

## 7. Publishing Images to DockerHub

The Docker images are published to **DockerHub** so they can be pulled by the EC2 server and Kubernetes cluster during deployment.

### Step 1 — Create DockerHub Repository

1. Log in to [hub.docker.com](https://hub.docker.com)
2. Create two repositories:
   - `developeranil754/cloudlink-backend`
   - `developeranil754/cloudlink-frontend`

[SCREENSHOT: DockerHub showing the two repositories `cloudlink-backend` and `cloudlink-frontend`]

### Step 2 — Tag and Push Images

```bash
# Login to DockerHub
docker login

# Tag images
docker tag cloudlink-backend developeranil754/cloudlink-backend:latest
docker tag cloudlink-frontend developeranil754/cloudlink-frontend:latest

# Push to DockerHub
docker push developeranil754/cloudlink-backend:latest
docker push developeranil754/cloudlink-frontend:latest
```

[SCREENSHOT: Terminal showing successful `docker push` output]

[SCREENSHOT: DockerHub repository page showing the pushed image with tags]

### Step 3 — GitHub Actions Handles This Automatically

In the CI/CD pipeline, Docker images are built and pushed automatically on every `main` branch commit. The pipeline uses GitHub Secrets `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` for authentication.

---

## 8. AWS Infrastructure with Terraform

### Overview

AWS infrastructure is provisioned using **Terraform** (Infrastructure as Code). This ensures the infrastructure is reproducible, version-controlled, and can be destroyed and recreated consistently.

### Resources Created

| Resource | Purpose |
|---|---|
| `aws_security_group` | Firewall rules — opens ports 22, 80, 5000, 3000, 9090 |
| `aws_instance` | EC2 t2.micro Ubuntu 24.04 server |
| `aws_eip` | Elastic IP — static IP address that never changes |
| `aws_eip_association` | Links the EIP to the EC2 instance |

### Key Design Decision — Decoupled Elastic IP

The Elastic IP is a **separate resource** from the EC2 instance (`aws_eip_association`). This means:
- Destroying and recreating the EC2 instance never changes the IP address
- The GitHub Actions secret `EC2_HOST` never needs to be updated again

```hcl
# Elastic IP — persists independently of the EC2 instance
resource "aws_eip" "cloudlink" {
  domain = "vpc"
}

# Association is separate — destroying EC2 doesn't destroy the EIP
resource "aws_eip_association" "cloudlink" {
  instance_id   = aws_instance.cloudlink.id
  allocation_id = aws_eip.cloudlink.id
}
```

### Security Group — Open Ports

```hcl
ingress { from_port = 22,   description = "SSH"        }
ingress { from_port = 80,   description = "HTTP"       }
ingress { from_port = 5000, description = "Backend API" }
ingress { from_port = 9090, description = "Prometheus"  }
ingress { from_port = 3000, description = "Grafana"     }
```

### Terraform Commands

```bash
cd terraform

# Initialize Terraform (download providers)
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply -auto-approve

# Get the Elastic IP address
terraform output public_ip

# Replace only the EC2 instance (keeps EIP)
terraform destroy -target="aws_instance.cloudlink" -auto-approve
terraform apply -auto-approve
```

[SCREENSHOT: Terminal showing `terraform apply` output with resources being created]

[SCREENSHOT: AWS Console — EC2 Instances page showing the running `cloudlink-server` instance]

[SCREENSHOT: AWS Console — Elastic IPs page showing the EIP associated with the instance]

[SCREENSHOT: AWS Console — Security Groups page showing the inbound rules]

---

## 9. CI/CD Pipeline with GitHub Actions

### Overview

The CI/CD pipeline is defined in `.github/workflows/ci-cd.yml` and runs automatically on every push to the `main` branch. It has three jobs:

```
Push to main
     │
     ▼
┌─────────────┐
│  Build &    │  Builds Docker images, pushes to DockerHub
│  Push       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Deploy     │  SSH into EC2, writes docker-compose.yml,
│  to EC2     │  starts all containers
└─────────────┘
```

### GitHub Secrets Required

Navigate to **GitHub → Repository → Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | `developeranil754` |
| `DOCKERHUB_TOKEN` | Your DockerHub access token |
| `EC2_HOST` | The Elastic IP (e.g., `100.50.142.197`) |
| `EC2_USERNAME` | `ubuntu` |
| `EC2_PRIVATE_KEY` | Contents of your `.pem` private key file |

[SCREENSHOT: GitHub repository Settings → Secrets page showing all 5 secrets configured]

### Pipeline — Job 1: Build and Push Docker Images

```yaml
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/cloudlink-backend:latest
      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/cloudlink-frontend:latest
```

### Pipeline — Job 2: Deploy to EC2

The deploy job SSHs into the EC2 instance and:
1. Creates `/opt/cloudlink/` directory
2. Writes the full `docker-compose.yml` dynamically
3. Writes `prometheus.yml` configuration
4. Writes Grafana provisioning files (datasource + dashboard)
5. Pulls latest images from DockerHub
6. Stops old containers (with force-remove to prevent naming conflicts)
7. Starts all containers: frontend, backend, mongodb, prometheus, grafana

```yaml
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_PRIVATE_KEY }}
          script: |
            sudo mkdir -p /opt/cloudlink
            cd /opt/cloudlink
            # Write docker-compose.yml
            # Write prometheus.yml
            # Write grafana provisioning files
            sudo docker compose pull
            sudo docker compose down --remove-orphans || true
            sudo docker compose up -d
```

[SCREENSHOT: GitHub Actions page showing a successful pipeline run with green checkmarks on all jobs]

[SCREENSHOT: GitHub Actions — Build and Push job expanded, showing Docker images being pushed]

[SCREENSHOT: GitHub Actions — Deploy job expanded, showing containers starting and becoming healthy]

---

## 10. Kubernetes Deployment with Minikube

### Overview

The application is also deployable on **Kubernetes** using Minikube for local cluster simulation. All Kubernetes manifests are in `devops/k8s/`.

### Kubernetes Resources

| File | Resources Created |
|---|---|
| `namespace.yaml` | `cloudlink` namespace |
| `configmap.yaml` | App configuration (ports, hosts, URLs) |
| `secrets.yaml` | MongoDB connection string (base64 encoded) |
| `mongodb.yaml` | MongoDB Deployment + PVC + Service |
| `backend.yaml` | Backend Deployment (2 replicas) + Service |
| `frontend.yaml` | Frontend Deployment (2 replicas) + Service |
| `ingress.yaml` | Nginx Ingress routing rules |
| `prometheus.yaml` | Prometheus ConfigMap + Deployment + NodePort |
| `grafana.yaml` | Grafana ConfigMaps + Deployment + NodePort |

### Step 1 — Start Minikube

```bash
minikube start
minikube addons enable ingress
```

[SCREENSHOT: Terminal showing `minikube start` completing successfully]

[SCREENSHOT: Terminal showing `minikube addons enable ingress` with ingress enabled]

### Step 2 — Deploy All Manifests

```bash
kubectl apply -f devops/k8s/namespace.yaml
kubectl apply -f devops/k8s/configmap.yaml
kubectl apply -f devops/k8s/secrets.yaml
kubectl apply -f devops/k8s/mongodb.yaml
kubectl apply -f devops/k8s/backend.yaml
kubectl apply -f devops/k8s/frontend.yaml
kubectl apply -f devops/k8s/ingress.yaml
kubectl apply -f devops/k8s/prometheus.yaml
kubectl apply -f devops/k8s/grafana.yaml
```

[SCREENSHOT: Terminal showing all `kubectl apply` commands completing with `created` or `configured`]

### Step 3 — Verify Pods are Running

```bash
kubectl get pods -n cloudlink
```

Expected output:
```
NAME                          READY   STATUS    RESTARTS   AGE
backend-79885cb59-fgnjf       1/1     Running   0          5m
backend-79885cb59-ncs4b       1/1     Running   0          5m
frontend-5c789768d6-k8c5x     1/1     Running   0          5m
frontend-5c789768d6-ktvwd     1/1     Running   0          5m
grafana-769f77ff88-r78t8      1/1     Running   0          5m
mongodb-56fc6cf4d-brtcg       1/1     Running   0          5m
prometheus-58474f48f6-26sgw   1/1     Running   0          5m
```

[SCREENSHOT: Terminal showing `kubectl get pods -n cloudlink` with all pods in Running state]

### Step 4 — Configure Hosts File (Windows)

Run PowerShell as Administrator:

```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "192.168.49.2 cloudlink.local"
```

[SCREENSHOT: Hosts file opened in Notepad showing the `192.168.49.2 cloudlink.local` entry]

### Step 5 — Access the Application

On Windows with Docker driver, use `minikube service` to create a tunnel:

```powershell
# Open the app
minikube service frontend-service -n cloudlink

# Get Grafana URL
minikube service grafana-service -n cloudlink --url

# Get Prometheus URL
minikube service prometheus-service -n cloudlink --url
```

[SCREENSHOT: Terminal showing `minikube service` output with the tunnel URL]

[SCREENSHOT: Browser showing the CloudLink app running via Minikube]

### Kubernetes Architecture Diagram

```
                    cloudlink.local
                          │
                    ┌─────▼──────┐
                    │   Ingress  │  nginx ingress controller
                    │ Controller │
                    └──┬─────┬──┘
                       │     │
              /api/*   │     │  /*
                       │     │
            ┌──────────▼┐   ┌▼───────────┐
            │  backend  │   │  frontend  │
            │  Service  │   │  Service   │
            └──────┬────┘   └────────────┘
                   │
            ┌──────▼────┐
            │  mongodb  │
            │  Service  │
            └───────────┘
```

---

## 11. Monitoring with Prometheus and Grafana

### Overview

The monitoring stack consists of:
- **Prometheus** — Scrapes metrics from the backend's `/metrics` endpoint every 10 seconds
- **Grafana** — Visualizes the metrics in a pre-built dashboard with 7 panels

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'cloudlink-backend'
    metrics_path: '/metrics'
    scrape_interval: 10s
    static_configs:
      - targets: ['backend:5000']   # Docker Compose
        labels:
          service: 'backend'        # Required for dashboard queries
```

> **Important:** The `service: 'backend'` label is mandatory. All Grafana dashboard queries filter by `{service="backend"}`. Without this label, the dashboard shows "No data".

### Grafana Dashboard — CloudLink URL Shortener Dashboard

The dashboard (`cloudlink-dashboard.json`) contains 7 panels:

| Panel | Type | What it Shows |
|---|---|---|
| Total HTTP Requests | Stat | Cumulative request count |
| Request Rate (req/s) | Time Series | Live requests per second by route |
| Requests by Status Code | Pie Chart | 2xx / 4xx / 5xx breakdown |
| Request Duration p50/p95/p99 | Time Series | Latency percentiles |
| CPU Usage | Time Series | Node.js process CPU |
| Memory Usage (Heap) | Time Series | Heap used vs total |
| Active Handles & Requests | Time Series | Node.js concurrency |

### Accessing Grafana

**On AWS:**
```
http://100.50.142.197:3000
```

**On Minikube:**
```bash
minikube service grafana-service -n cloudlink
```

[SCREENSHOT: Prometheus at `http://<ip>:9090` — Status → Targets page showing `cloudlink-backend` as UP]

[SCREENSHOT: Grafana home page at `http://<ip>:3000` showing the CloudLink folder]

[SCREENSHOT: Grafana — CloudLink URL Shortener Dashboard showing all 7 panels with live data]

[SCREENSHOT: Grafana — Request Rate panel zoomed in showing traffic over time]

[SCREENSHOT: Grafana — Memory Usage panel showing Node.js heap metrics]

---

## 12. Final Verification

### AWS Deployment Checklist

After a successful CI/CD run, verify each service:

```bash
# App
curl http://100.50.142.197/health

# Backend direct
curl http://100.50.142.197:5000/health

# Prometheus targets
curl http://100.50.142.197:9090/api/v1/targets

# Check all containers on the server (via AWS CLI)
aws ec2 describe-instances \
  --filters "Name=tag:Project,Values=cloudlink" \
  --query "Reservations[*].Instances[*].{State:State.Name,IP:PublicIpAddress}"
```

[SCREENSHOT: Browser showing `http://100.50.142.197` — the live CloudLink application on AWS]

[SCREENSHOT: Browser showing `http://100.50.142.197:9090` — Prometheus UI on AWS]

[SCREENSHOT: Browser showing `http://100.50.142.197:3000` — Grafana on AWS with the dashboard]

### Minikube Deployment Checklist

```powershell
# All pods running
kubectl get pods -n cloudlink

# All services
kubectl get services -n cloudlink

# Ingress address assigned
kubectl get ingress -n cloudlink
```

[SCREENSHOT: Terminal showing `kubectl get pods -n cloudlink` — all 7 pods Running]

[SCREENSHOT: Terminal showing `kubectl get services -n cloudlink` — all services listed]

[SCREENSHOT: Browser showing the app via Minikube URL]

### Complete Project Summary

This project demonstrates the following DevOps and Cloud Engineering concepts:

| Concept | Implementation |
|---|---|
| **Containerization** | Docker multi-stage builds for backend and frontend |
| **Container Orchestration** | Kubernetes manifests with Deployments, Services, Ingress, PVCs |
| **Infrastructure as Code** | Terraform provisioning AWS EC2, Security Groups, Elastic IP |
| **CI/CD Automation** | GitHub Actions pipeline — build, push, deploy on every commit |
| **Configuration Management** | Kubernetes ConfigMaps and Secrets for environment separation |
| **Service Discovery** | Kubernetes DNS (service names as hostnames) |
| **Health Checks** | Docker Compose `condition: service_healthy` + K8s liveness/readiness probes |
| **Persistent Storage** | Kubernetes PersistentVolumeClaim for MongoDB data |
| **Observability** | Prometheus metrics scraping + Grafana dashboards |
| **Zero-downtime Deploy** | Rolling updates via `kubectl rollout restart` |
| **Static IP Management** | AWS Elastic IP decoupled from EC2 for persistent addressing |
| **Secret Management** | GitHub Actions Secrets for credentials, K8s Secrets for runtime |

---

*Document generated: May 2026*
*Project repository: https://github.com/developeranil65/cloud-native-url-shortner*
