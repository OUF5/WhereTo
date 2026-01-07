# Service Account for Cloud Run
resource "google_service_account" "cloud_run" {
  account_id   = "adventure-roulette-run"
  display_name = "Adventure Roulette Cloud Run Service Account"
}

# Cloud Run Backend Service
resource "google_cloud_run_v2_service" "backend" {
  name     = "adventure-roulette-backend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run.email

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}/backend:latest"

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }

      ports {
        container_port = 3000
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "HOST"
        value = "0.0.0.0"
      }

      env {
        name  = "CORS_ORIGIN"
        value = var.cors_origin
      }

      env {
        name  = "JWT_ACCESS_EXPIRES_IN"
        value = "15m"
      }

      env {
        name  = "JWT_REFRESH_EXPIRES_IN"
        value = "7d"
      }

      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.database_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }

      startup_probe {
        http_get {
          path = "/health"
          port = 3000
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 3000
        }
        period_seconds    = 30
        failure_threshold = 3
      }
    }
  }

  depends_on = [
    google_secret_manager_secret_version.database_url,
    google_secret_manager_secret_version.jwt_secret,
    google_project_service.apis,
  ]
}

# Allow unauthenticated access (public API)
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  location = google_cloud_run_v2_service.backend.location
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Output the Cloud Run URL
output "backend_url" {
  value = google_cloud_run_v2_service.backend.uri
}

