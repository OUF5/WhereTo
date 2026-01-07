output "project_id" {
  value = var.project_id
}

output "region" {
  value = var.region
}

output "database_instance_name" {
  value = google_sql_database_instance.main.name
}

output "database_private_ip" {
  value     = google_sql_database_instance.main.private_ip_address
  sensitive = true
}

output "vpc_connector_name" {
  value = google_vpc_access_connector.connector.name
}

