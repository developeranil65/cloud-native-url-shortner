# =============================================================================
# Input Variables
# =============================================================================

variable "aws_region" {
  description = "AWS region to deploy the infrastructure"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (t2.micro is free-tier eligible)"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Name of the AWS SSH key pair for EC2 access"
  type        = string
}

variable "ami_id" {
  description = "Ubuntu AMI ID (defaults to Ubuntu 22.04 LTS in us-east-1)"
  type        = string
  default     = ""
}

variable "dockerhub_username" {
  description = "DockerHub username for pulling application images"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "cloudlink"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into the EC2 instance (e.g., your IP)"
  type        = string
  default     = "0.0.0.0/0"
}
