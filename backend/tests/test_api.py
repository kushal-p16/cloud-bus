import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "SmartBus" in data["service"]


def test_login_demo_admin():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@smartbus.demo", "password": "Admin@123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "admin"


def test_login_demo_passenger():
    response = client.post(
        "/api/auth/login",
        json={"email": "passenger@smartbus.demo", "password": "Passenger@123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "passenger"


def test_login_invalid_credentials():
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@smartbus.demo", "password": "WrongPassword"},
    )
    assert response.status_code == 401


def test_get_buses():
    response = client.get("/api/buses")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "bus_number" in data[0]


def test_get_live_bus_locations():
    response = client.get("/api/buses/live-locations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["is_simulated"] is True
    assert "latitude" in data[0]
    assert "longitude" in data[0]


def test_get_routes():
    response = client.get("/api/routes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 10
    assert "route_number" in data[0]


def test_get_bus_stops():
    response = client.get("/api/stops")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 10
    assert any("Mysuru" in s["stop_name"] for s in data)


def test_ml_prediction_endpoint():
    payload = {
        "bus_id": 1,
        "route_id": 1,
        "travel_date": "2026-11-02",
        "travel_hour": 9,
        "bus_capacity": 50,
        "historical_route_demand": 1.4,
    }
    response = client.post("/api/predictions/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_passenger_count" in data
    assert data["predicted_passenger_count"] >= 0
    assert "occupancy_percentage" in data
    assert data["occupancy_category"] in ["LOW", "MODERATE", "HIGH", "NEAR_FULL", "OVERCROWDED"]
    assert data["is_peak_hour"] is True


def test_bus_search_with_recommendations():
    payload = {
        "source": "Mysuru City Bus Stand (CBS)",
        "destination": "Infosys Mysuru Campus",
        "travel_date": "2026-11-02",
        "travel_hour": 9,
    }
    response = client.post("/api/predictions/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # Confirm recommendation flag is set for least crowded alternative
    assert any(b["is_recommended"] is True for b in data)


def test_model_metrics():
    response = client.get("/api/predictions/model-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "mae" in data
    assert "r2_score" in data
    assert data["r2_score"] > 0.85
    assert len(data["feature_importances"]) > 0


def test_analytics_kpis():
    response = client.get("/api/analytics/kpis")
    assert response.status_code == 200
    data = response.json()
    assert data["total_buses"] >= 20
    assert data["active_buses"] > 0
    assert data["total_routes"] >= 10


def test_role_authorization_protection():
    # Passenger cannot create a bus
    passenger_login = client.post(
        "/api/auth/login",
        json={"email": "passenger@smartbus.demo", "password": "Passenger@123"},
    ).json()
    passenger_token = passenger_login["access_token"]

    unauth_resp = client.post(
        "/api/buses",
        headers={"Authorization": f"Bearer {passenger_token}"},
        json={
            "bus_number": "KA-09-F-9999",
            "registration_number": "KA09F9999",
            "capacity": 50,
        },
    )
    assert unauth_resp.status_code == 403
