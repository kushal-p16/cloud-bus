FROM node:22-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM python:3.10-slim AS backend

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency list
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML artifacts and backend code
COPY ml /app/ml
COPY backend/app /app/app
COPY --from=frontend-build /frontend/dist /app/static

# Set PYTHONPATH so imports work cleanly
ENV PYTHONPATH="/app:/app/backend"
ENV ENVIRONMENT="production"

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
