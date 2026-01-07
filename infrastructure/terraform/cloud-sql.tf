# Cloud SQL PostgreSQL Instance
resource "google_sql_database_instance" "main" {
  name             = "adventure-roulette-db-${var.environment}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = var.db_tier
    availability_type = "ZONAL" # Stage 1: no HA to save costs
    disk_size         = 10
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
    }

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }

    maintenance_window {
      day  = 7 # Sunday
      hour = 3
    }
  }

  deletion_protection = false # Set to true in production

  depends_on = [
    google_service_networking_connection.private_vpc,
    google_project_service.apis,
  ]
}

# Database
resource "google_sql_database" "main" {
  name     = "adventure_roulette"
  instance = google_sql_database_instance.main.name
}

# Database user
resource "google_sql_user" "main" {
  name     = "adventure_app"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

