# Adventure Roulette

A "Where To?" app for friend groups to decide on places to hang out.

## Project Structure

```
adventure-roulette/
├── backend/               # Fastify + TypeScript + Prisma API
├── infrastructure/        # Terraform configs for GCP
├── cloudbuild.yaml       # Cloud Build CI/CD pipeline
└── docker-compose.yml    # Local development
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env file and configure
cp env.example .env
# Edit .env with your settings

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Run development server
npm run dev
```

### 3. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a new user + create group
curl -X POST http://localhost:3000/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "city": "Riyadh",
    "mode": "create_tenant",
    "groupName": "Test Group"
  }'
```

### 4. Run Tests

```bash
cd backend
npm test
```

---

## GCP Deployment Guide

### Prerequisites

1. **GCP Account** with billing enabled
2. **gcloud CLI** installed and authenticated
3. **Terraform** installed (v1.0+)

### Step 1: Create GCP Project

```bash
# Set your project ID
export PROJECT_ID="adventure-roulette-123"

# Create project
gcloud projects create $PROJECT_ID

# Set as default
gcloud config set project $PROJECT_ID

# Link billing account
gcloud billing accounts list
gcloud billing projects link $PROJECT_ID --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### Step 2: Authenticate for Terraform

```bash
# Login with application default credentials
gcloud auth application-default login

# Enable required APIs manually (Terraform will also do this)
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  vpcaccess.googleapis.com \
  compute.googleapis.com \
  servicenetworking.googleapis.com
```

### Step 3: Deploy Infrastructure with Terraform

```bash
cd infrastructure/terraform

# Create your variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values:
# - project_id = "adventure-roulette-123"
# - db_password = "your-secure-password"
# - jwt_secret = "your-32-char-jwt-secret-here!!!"

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Apply (this takes ~5-10 minutes)
terraform apply
```

**Note:** First deployment may fail on Cloud Run because no image exists yet. That's expected - continue to Step 4.

### Step 4: Build and Push First Image

```bash
# Get the Artifact Registry URL
export REGION="me-central1"
export REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/adventure-roulette"

# Configure Docker for Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and push the backend image
cd backend
docker build -t ${REGISTRY}/backend:latest .
docker push ${REGISTRY}/backend:latest
```

### Step 5: Run Database Migrations

```bash
# Get the DATABASE_URL from Secret Manager
export DATABASE_URL=$(gcloud secrets versions access latest --secret=adventure-roulette-database-url)

# Run migrations (from your local machine or Cloud Shell)
cd backend
npm install
npx prisma migrate deploy
```

**Alternative:** Use Cloud SQL Proxy for local migrations:
```bash
# Download Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.2/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy

# Start proxy (get instance connection name from Terraform output)
./cloud-sql-proxy --port 5433 $PROJECT_ID:$REGION:adventure-roulette-db-dev &

# Update DATABASE_URL to use localhost:5433
export DATABASE_URL="postgresql://adventure_app:YOUR_PASSWORD@localhost:5433/adventure_roulette"
npx prisma migrate deploy
```

### Step 6: Deploy to Cloud Run

After the first image is pushed, re-run Terraform or deploy manually:

```bash
# Option A: Re-run Terraform
cd infrastructure/terraform
terraform apply

# Option B: Deploy manually via gcloud
gcloud run deploy adventure-roulette-backend \
  --image=${REGISTRY}/backend:latest \
  --region=${REGION} \
  --platform=managed
```

### Step 7: Setup Cloud Build Trigger (CI/CD)

```bash
# Connect your GitHub repo to Cloud Build
# Go to: https://console.cloud.google.com/cloud-build/triggers

# Or use gcloud:
gcloud builds triggers create github \
  --repo-name=YOUR_GITHUB_REPO \
  --repo-owner=YOUR_GITHUB_USERNAME \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --substitutions=_REGION=me-central1
```

### Step 8: Verify Deployment

```bash
# Get the Cloud Run URL
export BACKEND_URL=$(gcloud run services describe adventure-roulette-backend --region=$REGION --format='value(status.url)')

# Test health endpoint
curl ${BACKEND_URL}/health

# Test registration
curl -X POST ${BACKEND_URL}/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "city": "Riyadh",
    "mode": "create_tenant",
    "groupName": "Test Group"
  }'
```

---

## API Endpoints (Stage 1)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/v1/auth/register` | No | Register user + create/join group |
| POST | `/v1/auth/login` | No | Login |
| POST | `/v1/auth/refresh` | No | Refresh tokens |
| GET | `/v1/users/me` | Yes | Get current user |
| GET | `/v1/tenants/:id` | Yes | Get group info |
| GET | `/v1/tenants/:id/members` | Yes | List group members |
| POST | `/v1/tenants/:id/places` | Yes | Suggest a place |
| GET | `/v1/tenants/:id/places` | Yes | List suggested places |
| POST | `/v1/tenants/:id/spins` | Yes | Spin the roulette |
| GET | `/v1/catalog/categories` | No | List categories |

---

## Estimated GCP Costs (Stage 1)

| Service | Monthly Cost |
|---------|-------------|
| Cloud SQL (db-f1-micro) | ~$9 |
| Cloud Run | ~$0-5 (scales to zero) |
| Artifact Registry | ~$1 |
| Secret Manager | ~$0.50 |
| VPC Connector | ~$7 |
| **Total** | **~$18-22/month** |

---

## Troubleshooting

### "Cloud Run service not found"
The Cloud Run service is created by Terraform but needs an image to exist first. Push an image manually (Step 4) then re-run `terraform apply`.

### "Connection refused" to database
Cloud Run connects to Cloud SQL via private IP. Ensure:
1. VPC connector is created
2. Cloud SQL has private IP enabled
3. Service account has correct permissions

### Migrations fail
Use Cloud SQL Proxy to connect from your local machine, or run migrations from Cloud Build (already configured in cloudbuild.yaml).

---

## License

MIT

