# Academic Project Report

## Design and Deployment of a Scalable Web Application on Cloud – Smart Public Bus Occupancy Prediction System

> ### 🏷️ PROJECT WATERMARK & AUTHORSHIP
> **Project by**: **Kushal P** and **Indukiran C**  
> **Course**: Cloud Computing & Application Development  
> **Academic Target**: United Nations Sustainable Development Goal 11 (Sustainable Cities and Communities) — Target 11.2  
> **Focus Prototype**: Mysuru Urban Transit Network, Karnataka, India  

---

### Abstract

Urban public transit systems frequently suffer from severe passenger crowding during peak commuter hours while experiencing sub-optimal utilization during mid-day windows. Such crowding degrades commuter comfort, increases dwell times, and discourages public transit adoption in favor of private vehicles—exacerbating carbon emissions and urban traffic gridlock.

This project presents **SmartBus AI**, an end-to-end, cloud-deployable full-stack application that leverages machine learning to forecast public bus occupancy and recommend less crowded alternatives in real time. Deployed across a 3-tier cloud architecture utilizing Amazon Web Services (AWS), the platform serves two distinct user classes: commuters seeking comfortable transit options and transport authorities monitoring fleet capacity and route saturation.

The predictive core utilizes an ensemble Random Forest Regressor trained on 20,400 chronologically sequenced transit records spanning 10 key Mysuru city transit routes. On an independent held-out test partition of 4,080 samples, the model achieved a **Coefficient of Determination ($R^2$) of 0.9654**, a **Mean Absolute Error (MAE) of 2.10 passengers**, and a **Root Mean Squared Error (RMSE) of 2.66 passengers**. The system demonstrates horizontal cloud scalability, automated Docker containerization, robust role-based access control, and direct alignment with UN SDG Target 11.2.

---

### Chapter 1: Introduction & Sustainable Development Goals

#### 1.1 Motivation & Background
Rapid urbanization in developing smart cities creates an urgent demand for efficient public transportation. In cities like Mysuru, bus services operated by state transit agencies represent the backbone of daily mobility for students, factory workers, IT professionals, and tourists. However, uneven ridership distribution causes lead buses on popular corridors to become dangerously overcrowded, while trailing buses remain underutilized.

#### 1.2 UN SDG 11: Sustainable Cities and Communities
This project directly implements **UN SDG Target 11.2**:
> *"By 2030, provide access to safe, affordable, accessible and sustainable transport systems for all, improving road safety, notably by expanding public transport, with special attention to the needs of those in vulnerable situations, women, children, persons with disabilities and older persons."*

By providing transparent crowding forecasts, SmartBus AI enables:
1. **Passenger Comfort and Safety**: Vulnerable commuters and seniors can plan journeys on less crowded vehicles with confirmed seating availability.
2. **Emissions Reduction**: Flattening peak crowding encourages sustained public transit usage over carbon-intensive private two-wheelers and automobiles.
3. **Optimized Resource Allocation**: Transport planners can detect underutilized routes and reallocate fleet units to high-demand corridors.

---

### Chapter 2: System Architecture & Cloud Design

The system implements a scalable, stateless cloud computing architecture:

```
[ Commuters & Transit Authority Admins ]
                   │
                   ▼ (HTTPS)
       [ Amazon CloudFront CDN ]
         ├── S3 Bucket (Vite React + TypeScript Single Page App)
         └── Application Load Balancer
                   │
                   ▼ (Reverse Proxy /api/*)
    [ Stateless FastAPI Microservices (AWS App Runner / ECS) ]
         ├── In-Memory Scikit-Learn Inference Engine
         ├── Database Connection Pool (SQLAlchemy)
         └── Amazon RDS PostgreSQL (Multi-AZ Managed Cluster)
```

#### 2.1 Scalability Guarantees
- **Stateless Compute**: Dockerized FastAPI workers store zero session state in local memory. Authentication is governed by signed JSON Web Tokens (JWT).
- **Horizontal Auto-Scaling**: Worker nodes scale out based on incoming CPU and request concurrency triggers.
- **Connection Pooling**: SQLAlchemy pre-pings pooled connections to eliminate database connection churn.

---

### Chapter 3: Machine Learning Formulation & Results

#### 3.1 Feature Space
The model ingests 10 multi-dimensional features representing temporal, vehicle, and historical transit dynamics:
1. `bus_id`: Vehicle identifier
2. `route_id`: Correlated transit corridor
3. `hour`: Departure hour (06:00 to 22:00)
4. `day_of_week`: Day index (0 = Monday, 6 = Sunday)
5. `is_weekend`: Binary flag
6. `is_peak_hour`: Binary flag (Morning: 08:00–10:00, Evening: 17:00–20:00)
7. `previous_passenger_count`: Vehicle lag feature
8. `previous_stop_passenger_count`: Stop lag feature
9. `bus_capacity`: Vehicle seating threshold (30 to 70 seats)
10. `historical_route_demand`: Route demand coefficient (0.95 to 1.50)

#### 3.2 Evaluation Metrics
The model was trained on 16,320 records and evaluated on an independent test partition of 4,080 records using a chronological split:

| Metric | Formula | Value Achieved |
|---|---|---|
| **Mean Absolute Error (MAE)** | $\frac{1}{n} \sum |y - \hat{y}|$ | **2.10 passengers** |
| **Root Mean Squared Error (RMSE)** | $\sqrt{\frac{1}{n} \sum (y - \hat{y})^2}$ | **2.66 passengers** |
| **Coefficient of Determination ($R^2$)** | $1 - \frac{\sum (y - \hat{y})^2}{\sum (y - \bar{y})^2}$ | **0.9654 (96.5%)** |

#### 3.3 Feature Importance Hierarchy
1. `previous_stop_passenger_count`: **93.74%**
2. `previous_passenger_count`: **3.84%**
3. `hour`: **0.53%**
4. `bus_id`: **0.47%**
5. `day_of_week`: **0.35%**

---

### Chapter 4: Key Platform Deliverables

1. **Dual Access Landing Page**: Features side-by-side dedicated login panels for Passengers and Transport Authorities directly on the landing page, separated by a visible `OR` divider.
2. **Passenger Dashboard**:
   - Location-aware search across 10 Mysuru transit hubs.
   - Real-time occupancy categorization:
     - 0–40%: LOW (Green)
     - 41–70%: MODERATE (Blue)
     - 71–90%: HIGH (Orange)
     - 91–100%: NEAR FULL (Red)
     - \>100%: OVERCROWDED (Dark Red)
   - Intelligent recommendation engine highlighting the least crowded alternative bus serving the destination.
   - Interactive Leaflet OpenStreetMap view rendering stops, routes, and simulated vehicle telemetry markers.
3. **Transport Authority Operations Command Center**:
   - Overview KPI cards for fleet health and ridership.
   - Live telemetry monitoring with sensor drift simulation.
   - Complete Bus Fleet and Route Network CRUD management forms.
   - Dedicated ML analytics dashboard with interactive actual vs. predicted curves and feature importance charts.
   - Automated regulatory CSV reports export.

---

### Chapter 5: Conclusion & Future Scope

SmartBus AI successfully demonstrates that combining machine learning with cloud-native web architectures can measurably solve public transit challenges. By transforming raw historical passenger records into predictive crowding signals, the system empowers commuters, reduces crush load on urban buses, and advances United Nations Sustainable Development Goal 11. Future extensions may integrate real-time Automated Passenger Counter (APC) optical sensors and multi-modal transit transfers.
