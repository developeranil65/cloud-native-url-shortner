# =============================================================================
# Cloud Native URL Shortener - AWS Infrastructure
# =============================================================================
# Provisions an EC2 instance with Docker and Docker Compose, then
# automatically deploys the application using DockerHub images.
#
# Architecture:
#   EC2 (Ubuntu) → Docker Compose → [Frontend, Backend, MongoDB]
#
# No Kubernetes. No EKS. Simple and Free-Tier eligible.
# =============================================================================

# -----------------------------------------------------------------------------
# Data Source: Latest Ubuntu 22.04 LTS AMI
# -----------------------------------------------------------------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# -----------------------------------------------------------------------------
# Security Group
# -----------------------------------------------------------------------------
resource "aws_security_group" "cloudlink_sg" {
  name        = "${var.project_name}-sg"
  description = "Security group for CloudLink URL Shortener"

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  # Frontend (Nginx) on port 80
  ingress {
    description = "HTTP - Frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Backend API on port 5000
  ingress {
    description = "Backend API"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    description = "All outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg"
    Project = var.project_name
  }
}

resource "aws_instance" "cloudlink" {
  ami                    = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.cloudlink_sg.id]

  # Assign a public IP so the app is accessible from the internet
  associate_public_ip_address = true

  # Root volume — 20GB is enough for Docker images and MongoDB data
  root_block_device {
    volume_size           = 20
    volume_type           = "gp3"
    delete_on_termination = true
  }

  # User data script: installs Docker, pulls images, starts the app
  user_data = templatefile("${path.module}/user-data.sh", {
    dockerhub_username = var.dockerhub_username
    project_name       = var.project_name
  })

  tags = {
    Name    = "${var.project_name}-server"
    Project = var.project_name
  }
}
