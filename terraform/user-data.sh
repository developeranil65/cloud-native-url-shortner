#!/bin/bash
# =============================================================================
# EC2 User Data - CloudLink URL Shortener Deployment
# =============================================================================
# This script runs automatically when the EC2 instance launches.
# It installs Docker, Docker Compose, and Git, then deploys the application
# using Docker Compose with images pulled from DockerHub.
#
# NOTE: This file is processed by Terraform's templatefile() function.
#       Shell $variables use $$ to escape Terraform interpolation.
# =============================================================================

set -euo pipefail

# Log all output for debugging (viewable via: sudo cat /var/log/cloud-init-output.log)
exec > >(tee /var/log/cloudlink-deploy.log) 2>&1
echo "=== CloudLink Deployment Started at $$(date) ==="

# -----------------------------------------------------------------------------
# 1. System Update
# -----------------------------------------------------------------------------
echo ">>> Updating system packages..."
apt-get update -y
apt-get upgrade -y

# -----------------------------------------------------------------------------
# 2. Install Docker
# -----------------------------------------------------------------------------
echo ">>> Installing Docker..."
apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the Docker repository
echo \
  "deb [arch=$$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $$(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Add ubuntu user to docker group (for SSH access without sudo)
usermod -aG docker ubuntu

# -----------------------------------------------------------------------------
# 3. Install Git
# -----------------------------------------------------------------------------
echo ">>> Installing Git..."
apt-get install -y git

# -----------------------------------------------------------------------------
# 4. Create Application Directory
# -----------------------------------------------------------------------------
echo ">>> Setting up application directory..."
APP_DIR="/opt/${project_name}"
mkdir -p "$$APP_DIR"
cd "$$APP_DIR"

# -----------------------------------------------------------------------------
# 5. Create Docker Compose File
# -----------------------------------------------------------------------------
echo ">>> Creating docker-compose.yml..."
cat > docker-compose.yml <<'COMPOSE'
# =============================================================================
# CloudLink URL Shortener - EC2 Docker Compose (Production)
# =============================================================================
# Deployed automatically by Terraform user_data script.
# Images are pulled from DockerHub. No localhost references.
# =============================================================================

services:

  # Frontend - React SPA served via Nginx
  frontend:
    image: DOCKERHUB_USER_PLACEHOLDER/url-shortener-frontend:latest
    container_name: cloudlink-frontend
    ports:
      - "80:80"
    environment:
      - BACKEND_HOST=backend
      - BACKEND_PORT=5000
      - API_BASE_URL=/api
      - BASE_URL=
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - cloudlink-network
    restart: unless-stopped

  # Backend - Node.js + Express API
  backend:
    image: DOCKERHUB_USER_PLACEHOLDER/url-shortener-backend:latest
    container_name: cloudlink-backend
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/url-shortener
      - BASE_URL=http://frontend
      - NODE_ENV=production
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - cloudlink-network
    restart: unless-stopped

  # MongoDB - Database
  mongodb:
    image: mongo:7
    container_name: cloudlink-mongodb
    volumes:
      - mongo-data:/data/db
    networks:
      - cloudlink-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

volumes:
  mongo-data:
    driver: local

networks:
  cloudlink-network:
    driver: bridge
COMPOSE

# Replace the placeholder with the actual DockerHub username
# (We use a placeholder + sed because the heredoc is quoted to preserve YAML syntax)
sed -i "s|DOCKERHUB_USER_PLACEHOLDER|${dockerhub_username}|g" docker-compose.yml

echo ">>> docker-compose.yml created with DockerHub user: ${dockerhub_username}"

# -----------------------------------------------------------------------------
# 6. Pull Images and Start the Application
# -----------------------------------------------------------------------------
echo ">>> Pulling Docker images from DockerHub..."
docker compose pull

echo ">>> Starting the application..."
docker compose up -d

# -----------------------------------------------------------------------------
# 7. Verify Deployment
# -----------------------------------------------------------------------------
echo ">>> Waiting for services to be healthy..."
sleep 15

echo ">>> Container status:"
docker compose ps

echo ""
echo "=== CloudLink Deployment Completed at $$(date) ==="
echo "=== Application is accessible at http://$$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4) ==="
