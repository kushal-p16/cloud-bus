# SmartBus AI — AWS Cloud Deployment Guide

This guide describes how to deploy **SmartBus AI** onto Amazon Web Services (AWS) using production-grade infrastructure practices.

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
