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

resource "aws_security_group" "earnings_tracker_sg" {
  name        = "earnings-tracker-sg"
  description = "Security group for earnings tracker application"
  vpc_id      = "vpc-0fbb3230aa23edd61"

  # SSH access
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP access
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS access
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Application ports
  ingress {
    description = "Frontend"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend API"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "earnings-tracker-sg"
  }
}

resource "aws_instance" "earnings_tracker_app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3a.micro"
  subnet_id              = "subnet-008f56552ed22c9f4"
  vpc_security_group_ids = [aws_security_group.earnings_tracker_sg.id]

  key_name = "krystian-janas-infrastructure"
  
  associate_public_ip_address = true

  root_block_device {
    volume_type = "gp3"
    volume_size = 10
    encrypted   = true
    
    tags = {
      Name = "earnings-tracker-app-root"
    }
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io docker-compose-plugin git
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
    
    # Install Docker Compose standalone
    curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
  EOF
  )

  tags = {
    Name = "earnings-tracker-app"
    Environment = "production"
    Project = "earnings-tracker"
  }
}
