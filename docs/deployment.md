# SmartBus AI — Render Deployment Guide

This repository includes a Render Blueprint that deploys the React frontend and
FastAPI backend together in one web service, with a managed PostgreSQL database.
The app and API use the same origin, so no browser-side credentials or CORS
configuration are needed.

## Deploy a public demo

1. Push this repository, including `render.yaml`, to GitHub.
2. Sign in to [Render](https://render.com/) and create a new **Blueprint**.
3. Connect this repository and confirm the resources shown in `render.yaml`.
4. Choose **Apply**. Render builds the frontend and backend, creates PostgreSQL,
   generates a `SECRET_KEY`, and publishes the app at the web service URL.
5. Wait for the service health check to pass, then open the service URL.

The blueprint uses Render's free plans for a no-cost demo. Free web services can
spin down while idle, and free PostgreSQL databases expire after 30 days. Do not
use this configuration for permanent data or production traffic; select paid
plans in Render and arrange database backups for a persistent deployment.

The app seeds public demo accounts. Anyone can use the credentials shown in the
README, so treat this deployment as a public demo and do not enter real personal
or operational data.

Render keeps the generated `SECRET_KEY` and database connection string in its
environment settings. Do not paste account passwords, database URLs, or API
tokens into chat or commit them to the repository.

## Docker Compose (local)

```bash
docker compose up --build -d
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

---

# AWS Cloud Deployment (alternative)

The following describes an alternative deployment of **SmartBus AI** on AWS.

---

## 1. Cloud Architecture on AWS

| Layer | AWS Service | Purpose |
|---|---|---|
| **Edge & CDN** | Amazon CloudFront | SSL/TLS termination, Global edge caching, DDoS protection |
| **Frontend Hosting** | Amazon S3 (Static Website) | Hosts pre-built React/TypeScript single page application |
| **Compute / Backend** | AWS App Runner / Amazon ECS (Fargate) | Auto-scaling containerized FastAPI service |
| **Database** | Amazon RDS PostgreSQL | Managed multi-AZ relational database with connection pooling |
| **Object Storage** | Amazon S3 | Model serialization artifacts (`.joblib`) and CSV report archives |
| **Secrets Management**| AWS Secrets Manager | Secure storage of JWT secret keys and database credentials |
| **Observability** | Amazon CloudWatch | Application metrics, container logs, and threshold alarms |

---

## 2. Local Containerized Deployment (Docker Compose)

Before deploying to AWS, test the full multi-tier application locally using Docker Compose:

```bash
# 1. Clone repository
git clone https://github.com/your-username/smartbus-ai.git
cd smartbus-ai

# 2. Start PostgreSQL, FastAPI Backend, and Nginx Frontend
docker compose up --build -d

# 3. Check container status
docker compose ps

# 4. Open Application in Browser:
# Frontend: http://localhost:3000
# Backend API Docs: http://localhost:8000/docs
# Health Check: http://localhost:8000/health
```

---

## 3. Step-by-Step Production AWS Deployment

### Step 1: Provision Amazon RDS PostgreSQL
```bash
aws rds create-db-instance \
    --db-instance-identifier smartbus-postgres-prod \
    --db-instance-class db.t4g.micro \
    --engine postgres \
    --allocated-storage 20 \
    --master-username smartbus_admin \
    --master-user-password "YourStrongProdPassword123!" \
    --backup-retention-period 7 \
    --publicly-accessible \
    --region ap-south-1
```

### Step 2: Store Secrets in AWS Secrets Manager
```bash
aws secretsmanager create-secret \
    --name "smartbus/production/credentials" \
    --secret-string '{"DATABASE_URL":"postgresql://smartbus_admin:YourStrongProdPassword123!@smartbus-postgres-prod.xxxxxx.ap-south-1.rds.amazonaws.com:5432/smartbus_db","SECRET_KEY":"your-super-secret-jwt-key-32chars-minimum"}' \
    --region ap-south-1
```

### Step 3: Build & Push Backend Container to Amazon ECR
```bash
# Authenticate Docker to Amazon ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <YOUR_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name smartbus-backend --region ap-south-1

# Build and tag image
docker build -t smartbus-backend -f backend/Dockerfile .
docker tag smartbus-backend:latest <YOUR_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/smartbus-backend:latest

# Push to ECR
docker push <YOUR_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/smartbus-backend:latest
```

### Step 4: Deploy Backend via AWS App Runner
1. In the AWS App Runner console, create a new service.
2. Select **Container Registry** > **Amazon ECR**.
3. Select your `<YOUR_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/smartbus-backend:latest` image.
4. Set port to `8000`.
5. Add environment variables referencing your RDS connection string and JWT secret.
6. Set health check path to `/health`.
7. Click **Deploy**. AWS App Runner provisions a scalable HTTPS endpoint (e.g., `https://xxxxxx.ap-south-1.awsapprunner.com`).

### Step 5: Deploy Frontend to Amazon S3 & CloudFront
```bash
# 1. Update API_BASE in frontend/src/services/api.ts with your App Runner URL:
# const API_BASE = 'https://xxxxxx.ap-south-1.awsapprunner.com/api';

# 2. Build the production React bundle
cd frontend
npm ci
npm run build

# 3. Create S3 Bucket and sync files
aws s3 mb s3://smartbus-ai-frontend-prod --region ap-south-1
aws s3 sync dist/ s3://smartbus-ai-frontend-prod --delete

# 4. Create CloudFront Distribution pointing to the S3 bucket with SPA Error Response (404 -> /index.html)
```

---

## 4. Monitoring & Auto-Scaling

- **CloudWatch Alarm**: Trigger alarm if CPU utilization exceeds 75% for 3 consecutive minutes, automatically provisioning additional container replicas.
- **Health Checks**: AWS App Runner continuously probes `GET /health` every 20 seconds.
- **Failover**: Amazon RDS automated multi-AZ replication ensures continuous uptime during maintenance.
