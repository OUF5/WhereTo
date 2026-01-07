# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "main" {
  location      = var.region
  repository_id = "adventure-roulette"
  format        = "DOCKER"
  description   = "Docker repository for Adventure Roulette"

  depends_on = [google_project_service.apis]
}

# Output the registry URL for Cloud Build
output "artifact_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.main.repository_id}"
}

