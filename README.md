# Cloud Native URL Shortener

A production-ready, cloud-native URL shortener built with a modern stack, deployed via fully automated CI/CD to AWS.

## Architecture & Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS (Dark Mode UI)
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Infrastructure as Code:** Terraform (AWS EC2)
- **CI/CD:** GitHub Actions (DockerHub -> EC2 SSH Deploy)
- **Monitoring:** Prometheus & Grafana
- **Containerization:** Docker & Docker Compose

## Fully Automated CI/CD Pipeline

This repository is equipped with a zero-downtime, fully automated CI/CD pipeline using GitHub Actions.

When code is pushed to the `main` branch, the pipeline:
1. Builds the Docker images for the Frontend and Backend.
2. Pushes the images to DockerHub.
3. Securely connects to the AWS EC2 instance via SSH.
4. Pulls the latest images and restarts the application seamlessly.

### Required GitHub Secrets
To make the pipeline work, configure these secrets in your repository settings (`Settings > Secrets and variables > Actions`):

- `DOCKERHUB_USERNAME`: Your DockerHub username.
- `DOCKERHUB_TOKEN`: Your DockerHub Personal Access Token.
- `EC2_HOST`: The public IP address of your EC2 instance.
- `EC2_USERNAME`: `ubuntu` (default for AWS Ubuntu AMIs).
- `EC2_PRIVATE_KEY`: The raw contents of your `.pem` SSH key file.

## Provisioning Infrastructure

To deploy the AWS EC2 instance and Security Groups from scratch:

```bash
cd terraform
terraform init
terraform apply
```

This will automatically create a `docker-compose.yml` file on the server and start the application. Subsequent code updates are handled entirely by the GitHub Actions pipeline.

## Local Development

You can run the entire stack locally (including Monitoring) with a single command:

```bash
docker compose up --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:5000`
- Grafana: `http://localhost:3000` (Default login is bypassed or admin/admin)
- Prometheus: `http://localhost:9090`
