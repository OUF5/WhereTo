variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "me-central1" # Dammam - closest to Saudi Arabia
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro" # Smallest, ~$9/month
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret (min 32 characters)"
  type        = string
  sensitive   = true
}

variable "cors_origin" {
  description = "Allowed CORS origins"
  type        = string
  default     = "*"
}

