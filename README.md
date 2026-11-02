# SMARTBUS AI 🚌⚡
### Cloud-Based Smart Public Bus Occupancy Prediction System
**Academic Cloud Computing Project | United Nations SDG 11: Sustainable Cities and Communities (Target 11.2)**  
*Focus Prototype: Mysuru City Urban Transit Network, Karnataka, India*

> ### 🏷️ PROJECT WATERMARK
> **Project by Kushal P**  
> *"Smarter Journeys. Less Crowding. Sustainable Cities."*

---

## 🌟 Project Overview

**SmartBus AI** is an intelligent public transit platform that predicts bus passenger crowding using machine learning and guides commuters toward less crowded buses. It bridges the gap between commuters seeking comfortable transit and municipal transport authorities managing fleet capacity.

### Demo Credentials (Local Demonstration)

| Portal | Login Email | Password | Access Rights |
|---|---|---|---|
| **Passenger Portal** | `passenger@smartbus.demo` | `Passenger@123` | Search buses, view AI occupancy forecasts, find recommended alternatives, save favorite routes |
| **Transport Authority Portal** | `admin@smartbus.demo` | `Admin@123` | Fleet control room, bus & route CRUD, live occupancy table, ML analytics, CSV reports export |

*Note: Pre-filled one-click demo buttons are available directly on the landing page!*

---

## 🚀 Key Features

### 1. Dual Access Landing Page
- Modern SaaS landing page with brand identity, animated transit illustrations, and SDG 11 Target 11.2 badge.
- **Side-by-Side Dual Login Panels** for Passenger and Transport Authority directly on the homepage, separated by an `================ OR ================` divider.
- Full registration modal for new commuters.

### 2. Commuter / Passenger Portal
- **Location-Aware Bus Search**: Select departure and arrival stops from 10 Mysuru transit hubs (City Bus Stand, Suburban Bus Stand, Infosys Campus, Chamundi Hill, Kuvempunagar, Vijayanagar, etc.).
- **Real-Time AI Occupancy Prediction**:
  - `0% - 40%`: **LOW** (Emerald Green) — High seat availability
  - `41% - 70%`: **MODERATE** (Sky Blue) — Moderate crowding
  - `71% - 90%`: **HIGH** (Amber Orange) — Standing room only
  - `91% - 100%`: **NEAR FULL** (Red) — Full capacity
  - `> 100%`: **OVERCROWDED** (Dark Red) — Crush load warning
- **Smart Bus Recommendations**: Identifies and promotes the least crowded vehicle traveling along the identical route.
- **Interactive OpenStreetMap (Leaflet)**: Real-time map displaying transit stops, corridors, and animated vehicle telemetry markers (clearly labeled as simulated).
- **Vehicle Detail Modal**: Stop-by-stop passenger forecast chart and vehicle specifications.

### 3. Transport Authority Command Center
- **Overview KPI Cards**: Total buses, active units, total routes, today's passengers, average occupancy %, and overcrowding alerts.
- **Occupancy Monitoring**: Live fleet status table with level filters and a "Simulate Sensor Telemetry" trigger button.
- **Bus Fleet CRUD**: Add, edit, delete, assign routes, adjust seating capacity, and toggle maintenance status.
- **Route Network CRUD**: Add, edit, delete routes, map stop sequences, and configure journey durations.
- **ML Analytics**: Actual vs. predicted passenger curves, held-out test evaluation metrics, and feature importance weighting.
- **Demand Analytics**: 24-hour demand curves showcasing morning (08:00–10:00) and evening (17:00–20:00) peaks, plus weekly ridership distributions.
- **Reports & Data Export**: Instant CSV streaming and report views for Daily Occupancy, Route Utilization, Bus Performance, and Passenger Demand.

---

## 🧠 Machine Learning Engine

- **Algorithm**: `RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42)`
- **Dataset**: 20,400 chronologically sequenced records across 60 days covering 10 routes and 20 fleet units.
- **Train/Test Split**: Chronological 80/20 split (16,320 train samples / 4,080 test samples) to prevent temporal data leakage.
- **Verified Evaluation Metrics**:
  - **Mean Absolute Error (MAE)**: `2.10 passengers`
  - **Root Mean Squared Error (RMSE)**: `2.66 passengers`
  - **Coefficient of Determination ($R^2$)**: `0.9654 (96.5%)`
- **Top Feature Importances**:
  1. `previous_stop_passenger_count`: **93.74%**
  2. `previous_passenger_count`: **3.84%**
  3. `hour`: **0.53%**
  4. `bus_id`: **0.47%**
  5. `day_of_week`: **0.35%**

---

## 🛠️ Technology Stack

| Domain | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Leaflet / React-Leaflet |
| **Backend** | Python 3.10, FastAPI, Pydantic, SQLAlchemy, Alembic, Bcrypt, Python-JOSE (JWT) |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy, Joblib |
| **Database** | PostgreSQL (Production) / SQLite (Local Fallback) |
| **DevOps & Containers**| Docker, Docker Compose, Nginx, GitHub Actions CI/CD |
| **Cloud (AWS)** | Amazon S3, Amazon CloudFront, AWS App Runner / ECS, Amazon RDS, Amazon CloudWatch, AWS Secrets Manager |

---

## 💻 Quick Start & Local Execution

### Option A: Local Python & Node Setup

#### 1. Setup Backend & Train Model:
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Generate synthetic dataset and train the Random Forest model
python -m ml.train_model

# Run automated tests
pytest backend/tests/test_api.py -v

# Start FastAPI backend server (Runs on port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

#### 2. Setup Frontend:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (Runs on port 5173)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Option B: Docker Compose (Full Stack)

Run the full stack (PostgreSQL, FastAPI Backend, and React Nginx Frontend) with a single command:
```bash
docker compose up --build -d
```
- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend & Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🌐 Public Demo Deployment (Render)

The repository includes a Render Blueprint for a one-service deployment of the
frontend and API with PostgreSQL. Follow the [Render deployment guide](docs/deployment.md).
The free database expires after 30 days, and the published demo uses public
seeded accounts; do not enter real personal or operational data.

---

## 📁 Project Directory Structure

```
smartbus-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/           # Navbar, OccupancyBadge, ProgressBar, RouteMap
│   │   ├── context/              # AuthContext & Session Store
│   │   ├── dashboards/
│   │   │   ├── passenger/        # Passenger Dashboard & Search UI
│   │   │   └── authority/        # Fleet Control Room & Operations Analytics
│   │   ├── pages/                # Landing Page with Dual Login Panels
│   │   ├── services/             # REST API Client
│   │   ├── types/                # TypeScript Interfaces
│   │   ├── App.tsx               # Route Guards & Routing
│   │   └── main.tsx
│   ├── nginx.conf                # Nginx production reverse proxy config
│   ├── Dockerfile                # Multi-stage production container
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/                  # Auth, Buses, Routes, Stops, Occupancy, Predictions, Analytics, Reports
│   │   ├── core/                 # App Settings & Security (Bcrypt & JWT)
│   │   ├── database/             # SQLAlchemy Session & Database Seeder
│   │   ├── models/               # Relational Database Models
│   │   ├── schemas/              # Pydantic Schemas
│   │   └── main.py               # FastAPI App Entrypoint & Health Check
│   ├── tests/                    # Pytest Suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── ml/
│   ├── generate_dataset.py       # Realistic 20,400-record Mysuru transit dataset generator
│   ├── preprocess.py             # Feature engineering & chronological split
│   ├── train_model.py            # Random Forest Regressor training & metric evaluation
│   ├── predict.py                # In-memory inference engine
│   ├── evaluate.py               # Subgroup evaluation (peak vs. off-peak)
│   └── artifacts/                # Serialized model (.joblib), metrics.json, data.csv
│
├── docs/
│   ├── architecture.md           # Mermaid Cloud Architecture & Database ER Diagrams
│   ├── deployment.md             # Complete AWS Cloud Deployment Guide
│   ├── api.md                    # REST API Reference
│   └── project-report.md         # Comprehensive Academic Project Report
│
├── .github/workflows/
│   └── ci-cd.yml                 # Automated CI/CD workflow
├── docker-compose.yml            # Multi-container orchestration
├── .env.example
├── .gitignore
└── README.md
```

---

## 🧪 Testing & Verification

The project includes an automated test suite verifying all critical functional workflows:
```bash
pytest backend/tests/test_api.py -v
```
**Test Coverage Includes**:
- Health check verification (`/health`)
- Demo Passenger authentication & JWT validation
- Demo Transport Authority authentication & role validation
- Role-based authorization guard (ensuring passengers cannot delete or create buses)
- Transit entity retrieval (routes, buses, Mysuru stops)
- Live simulated telemetry endpoint
- ML prediction inference with non-negativity constraint
- Bus search with smart recommendation flag
- Real model evaluation metrics validation ($R^2 > 0.85$, $MAE < 3.0$)
- Operational KPI computation

---

## 🌍 UN SDG 11: Sustainable Cities and Communities
SmartBus AI aligns with **Target 11.2** by providing accessible, sustainable transportation through AI-driven passenger load redistribution, reducing peak crowding, decreasing waiting anxiety, and optimizing municipal fleet efficiency.
