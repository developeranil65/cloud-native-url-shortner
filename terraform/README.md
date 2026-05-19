# Cloud Native URL Shortener - Terraform AWS Deployment

Provisions an AWS EC2 instance and automatically deploys the CloudLink URL Shortener using Docker Compose with images from DockerHub.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│  AWS EC2 Instance (Ubuntu 22.04 / t2.micro)                  │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Frontend    │  │  Backend    │  │  MongoDB            │  │
│  │  (Nginx)     │  │  (Node.js)  │  │  (Persistent Vol)   │  │
│  │  Port 80     │  │  Port 5000  │  │  Port 27017         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         ▲                ▲                                   │
│         │    Docker Compose Network                          │
│         └────────────────┘                                   │
└──────────────────────────────────────────────────────────────┘
         ▲                ▲
         │                │
    Port 80          Port 5000
    (HTTP)           (API)
         │                │
    ┌────┴────────────────┴────┐
    │       Internet           │
    └──────────────────────────┘
```

## Prerequisites

1. **Terraform** installed (v1.0+)
2. **AWS CLI** configured with credentials (`aws configure`)
3. **AWS Key Pair** created in the target region
4. **Docker images** pushed to DockerHub:
   - `yourdockerhubusername/url-shortener-frontend:latest`
   - `yourdockerhubusername/url-shortener-backend:latest`

## Quick Start

### Step 1: Configure Variables

Edit `terraform.tfvars` with your values:

```hcl
aws_region         = "us-east-1"
instance_type      = "t2.micro"
key_name           = "your-aws-key-pair-name"
dockerhub_username = "yourdockerhubusername"
```

### Step 2: Deploy

```bash
cd terraform/

# Initialize Terraform
terraform init

# Preview the infrastructure changes
terraform plan

# Deploy (type 'yes' when prompted)
terraform apply
```

### Step 3: Access the Application

After `terraform apply` completes, the outputs will display:

```
frontend_url = "http://<EC2_PUBLIC_IP>"
backend_url  = "http://<EC2_PUBLIC_IP>:5000"
ssh_command  = "ssh -i ~/.ssh/your-key.pem ubuntu@<EC2_PUBLIC_IP>"
```

> **Note:** The user_data script takes 2-3 minutes to install Docker and start the containers. If the site isn't immediately available, wait and try again.

### Step 4: Verify Deployment

```bash
# SSH into the instance
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Check container status
docker compose -f /opt/cloudlink/docker-compose.yml ps

# View deployment logs
sudo cat /var/log/cloudlink-deploy.log

# Test the API
curl http://<EC2_PUBLIC_IP>:5000/health
```

## Tear Down

```bash
terraform destroy
```

This will terminate the EC2 instance and delete the security group.

## Infrastructure Details

| Resource         | Configuration                              |
|-----------------|--------------------------------------------|
| **AMI**         | Ubuntu 22.04 LTS (auto-discovered)         |
| **Instance**    | t2.micro (Free Tier eligible)              |
| **Storage**     | 20 GB gp3 EBS volume                      |
| **Network**     | Default VPC, public IP assigned            |
| **Ports Open**  | 22 (SSH), 80 (Frontend), 5000 (Backend)    |

## Security Notes

- SSH access is configurable via `allowed_ssh_cidr` — set it to your IP for production
- MongoDB is not exposed publicly (only accessible within Docker network)
- For production use, consider:
  - Adding HTTPS with an ALB and ACM certificate
  - Using a private subnet with a NAT gateway
  - Storing MongoDB data on a separate EBS volume
  - Using AWS Secrets Manager for credentials

## File Structure

```
terraform/
├── provider.tf         # AWS provider and version constraints
├── variables.tf        # Input variable definitions
├── terraform.tfvars    # Variable values (edit this)
├── main.tf             # EC2 instance, security group, AMI lookup
├── outputs.tf          # Public IP, URLs, SSH command
├── user-data.sh        # Bootstrap script (Docker install + app deploy)
└── .gitignore          # Exclude state files
```
