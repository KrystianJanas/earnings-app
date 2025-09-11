terraform {
  required_version = "~> 1.9.5"
  backend "s3" {
    encrypt = true
    bucket  = "010928214882-tf"
    region  = "eu-west-1"
    key     = "infrastructure/earnings-app/terraform.tfstate"
    profile = "krystianjanas"
  }
}
