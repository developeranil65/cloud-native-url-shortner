output "instance_id" {
  description = "EC2 Instance ID"
  value       = aws_instance.cloudlink.id
}

output "public_ip" {
  description = "Static Elastic IP address (use this for EC2_HOST GitHub Secret)"
  value       = aws_eip.cloudlink.public_ip
}

output "frontend_url" {
  description = "URL to access the frontend application"
  value       = "http://${aws_eip.cloudlink.public_ip}"
}

output "backend_url" {
  description = "URL to access the backend API"
  value       = "http://${aws_eip.cloudlink.public_ip}:5000"
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.cloudlink.public_ip}"
}

output "deployment_log_command" {
  description = "Command to view the deployment log on the EC2 instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.cloudlink.public_ip} 'sudo cat /var/log/cloudlink-deploy.log'"
}
