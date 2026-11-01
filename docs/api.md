# SmartBus AI — REST API Documentation

**Base URL**: `http://localhost:8000/api`  
**Swagger Interactive UI**: `http://localhost:8000/docs`  
**ReDoc**: `http://localhost:8000/redoc`

---

## Authentication

All protected endpoints require a JWT Bearer token in the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

### 1. User Login
- **Endpoint**: `POST /auth/login`
- **Request Body**:
  ```json
  {
    "email": "passenger@smartbus.demo",
    "password": "Passenger@123"
  }
  ```
- **Response** `200 OK`:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "role": "passenger",
    "user_id": 2,
    "email": "passenger@smartbus.demo",
    "full_name": "Priya Sharma"
  }
  ```

### 2. User Registration
- **Endpoint**: `POST /auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "full_name": "Rohan Patel",
    "phone": "+91 98450 11223",
    "role": "passenger"
  }
  ```

---

## Machine Learning Predictions & Search

### 3. Bus Search & Smart Recommendations
- **Endpoint**: `POST /predictions/search`
- **Request Body**:
  ```json
  {
    "source": "Mysuru City Bus Stand (CBS)",
    "destination": "Infosys Mysuru Campus",
    "travel_date": "2026-11-02",
    "travel_hour": 9
  }
  ```
- **Response** `200 OK`:
  ```json
  [
    {
      "bus_id": 1,
      "bus_number": "KA-09-F-1201",
      "registration_number": "KA09F1201",
      "route_id": 1,
      "route_number": "R-101",
      "route_name": "City Bus Stand to Infosys Mysuru (Express)",
      "source": "Mysuru City Bus Stand (CBS)",
      "destination": "Infosys Mysuru Campus",
      "bus_capacity": 50,
      "bus_type": "Electric AC",
      "estimated_arrival_mins": 14,
      "predicted_passenger_count": 25,
      "occupancy_percentage": 50.0,
      "occupancy_category": "MODERATE",
      "badge_color": "blue",
      "crowd_level_text": "Moderate Crowding (Few Seats)",
      "is_recommended": true,
      "last_updated": "20:30:00"
    }
  ]
  ```

### 4. Direct Prediction Inference
- **Endpoint**: `POST /predictions/predict`
- **Request Body**:
  ```json
  {
    "bus_id": 1,
    "route_id": 1,
    "travel_date": "2026-11-02",
    "travel_hour": 8,
    "bus_capacity": 50
  }
  ```

### 5. ML Model Metrics
- **Endpoint**: `GET /predictions/model-metrics`
- **Response** `200 OK`:
  ```json
  {
    "model_name": "Random Forest Regressor",
    "algorithm": "RandomForestRegressor(n_estimators=100, max_depth=16)",
    "trained_at": "2026-11-01T20:43:17.391264",
    "train_samples": 16320,
    "test_samples": 4080,
    "mae": 2.10,
    "rmse": 2.66,
    "r2_score": 0.9654,
    "feature_importances": [
      {"feature": "previous_stop_passenger_count", "importance": 0.9374},
      {"feature": "previous_passenger_count", "importance": 0.0384},
      {"feature": "hour", "importance": 0.0053},
      {"feature": "bus_id", "importance": 0.0047},
      {"feature": "day_of_week", "importance": 0.0035}
    ]
  }
  ```

---

## Fleet & Route Management

### 6. List Buses with Telemetry
- **Endpoint**: `GET /buses`
- **Query Params**: `route_id`, `status`, `skip`, `limit`

### 7. Live Map Locations
- **Endpoint**: `GET /buses/live-locations`
- Returns coordinates, speed, route, and occupancy category for all active vehicles.

### 8. List Routes & Ordered Stops
- **Endpoint**: `GET /routes`

### 9. List Bus Stops
- **Endpoint**: `GET /stops`

---

## Analytics & Reports

### 10. Dashboard KPIs
- **Endpoint**: `GET /analytics/kpis`
- **Response**:
  ```json
  {
    "total_buses": 20,
    "active_buses": 20,
    "total_routes": 10,
    "total_passengers_today": 14850,
    "average_occupancy_percentage": 58.5,
    "overcrowded_buses_count": 3,
    "underutilized_buses_count": 4
  }
  ```

### 11. Reports CSV Stream Export
- **Endpoint**: `GET /reports/download/{report_type}`
- **Parameters**: `report_type` (`daily-occupancy`, `route-utilization`, `bus-performance`, `passenger-demand`)
- **Headers**: `Content-Type: text/csv`, `Content-Disposition: attachment; filename=SmartBus_Daily_Occupancy_20261101.csv`
