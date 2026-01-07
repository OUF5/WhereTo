# VPC Network
resource "google_compute_network" "main" {
  name                    = "adventure-roulette-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.apis]
}

# Subnet for Cloud SQL private IP
resource "google_compute_subnetwork" "main" {
  name          = "adventure-roulette-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.main.id
}

# Private IP range for Cloud SQL
resource "google_compute_global_address" "private_ip" {
  name          = "adventure-roulette-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main.id
}

# Private connection for Cloud SQL
resource "google_service_networking_connection" "private_vpc" {
  network                 = google_compute_network.main.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip.name]
}

# VPC Connector for Cloud Run to access Cloud SQL
resource "google_vpc_access_connector" "connector" {
  name          = "adventure-roulette-connector"
  region        = var.region
  network       = google_compute_network.main.name
  ip_cidr_range = "10.8.0.0/28"

  depends_on = [google_project_service.apis]
}

