import os
import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.database.session import SessionLocal, Base, engine
from app.models import (
    User,
    BusStop,
    Route,
    RouteStop,
    Bus,
    OccupancyRecord,
    ModelMetric,
)
from app.core.security import get_password_hash

# Coordinates for Mysuru Transit Hubs
MYSURU_STOPS = [
    {"name": "Mysuru City Bus Stand (CBS)", "location": "City Centre", "lat": 12.3080, "lng": 76.6548},
    {"name": "Suburban Bus Stand", "location": "Nazarbad Road", "lat": 12.3115, "lng": 76.6582},
    {"name": "Vijayanagar 1st Stage", "location": "Vijayanagar", "lat": 12.3364, "lng": 76.6042},
    {"name": "Kuvempunagar Complex", "location": "Kuvempunagar", "lat": 12.2858, "lng": 76.6264},
    {"name": "Hebbal Industrial Area", "location": "Hebbal", "lat": 12.3552, "lng": 76.6033},
    {"name": "Jayalakshmipuram", "location": "Kalidasa Road", "lat": 12.3217, "lng": 76.6278},
    {"name": "Infosys Mysuru Campus", "location": "Hebbal Electronic City", "lat": 12.3592, "lng": 76.5925},
    {"name": "Chamundi Hill Temple", "location": "Chamundi Hills", "lat": 12.2743, "lng": 76.6705},
    {"name": "Mysuru Palace (Amba Vilas)", "location": "Palace Grounds", "lat": 12.3051, "lng": 76.6551},
    {"name": "University of Mysore", "location": "Manasagangotri", "lat": 12.3129, "lng": 76.6247},
    {"name": "Vontikoppal Temple", "location": "Vontikoppal", "lat": 12.3289, "lng": 76.6341},
    {"name": "Saraswathipuram Park", "location": "Saraswathipuram", "lat": 12.3023, "lng": 76.6322},
    {"name": "Gokulam 3rd Stage", "location": "Gokulam", "lat": 12.3325, "lng": 76.6298},
    {"name": "Metagalli Police Station", "location": "Metagalli", "lat": 12.3486, "lng": 76.6215},
    {"name": "Nazarbad Police Chowk", "location": "Nazarbad", "lat": 12.3084, "lng": 76.6663},
]

ROUTES_CONFIG = [
    {
        "number": "R-101",
        "name": "City Bus Stand to Infosys Mysuru (Express)",
        "source": "Mysuru City Bus Stand (CBS)",
        "destination": "Infosys Mysuru Campus",
        "distance": 14.8,
        "duration": 38,
        "demand": 1.45,
        "stops": [0, 9, 5, 12, 13, 4, 6],
    },
    {
        "number": "R-102",
        "name": "Suburban Bus Stand to Chamundi Hill",
        "source": "Suburban Bus Stand",
        "destination": "Chamundi Hill Temple",
        "distance": 13.5,
        "duration": 35,
        "demand": 1.25,
        "stops": [1, 8, 14, 7],
    },
    {
        "number": "R-103",
        "name": "Vijayanagar to Kuvempunagar Ring",
        "source": "Vijayanagar 1st Stage",
        "destination": "Kuvempunagar Complex",
        "distance": 11.2,
        "duration": 30,
        "demand": 1.15,
        "stops": [2, 10, 5, 11, 3],
    },
    {
        "number": "R-104",
        "name": "Hebbal to Mysuru Palace Heritage Line",
        "source": "Hebbal Industrial Area",
        "destination": "Mysuru Palace (Amba Vilas)",
        "distance": 12.4,
        "duration": 34,
        "demand": 1.30,
        "stops": [4, 13, 12, 10, 0, 8],
    },
    {
        "number": "R-105",
        "name": "University to City Bus Stand Student Shuttle",
        "source": "University of Mysore",
        "destination": "Mysuru City Bus Stand (CBS)",
        "distance": 6.8,
        "duration": 20,
        "demand": 1.20,
        "stops": [9, 11, 0],
    },
    {
        "number": "R-106",
        "name": "Jayalakshmipuram to Suburban Bus Stand",
        "source": "Jayalakshmipuram",
        "destination": "Suburban Bus Stand",
        "distance": 8.5,
        "duration": 25,
        "demand": 0.95,
        "stops": [5, 10, 9, 0, 1],
    },
    {
        "number": "R-107",
        "name": "Chamundi Hill to Vijayanagar Cross-City",
        "source": "Chamundi Hill Temple",
        "destination": "Vijayanagar 1st Stage",
        "distance": 18.2,
        "duration": 48,
        "demand": 1.05,
        "stops": [7, 8, 0, 11, 2],
    },
    {
        "number": "R-108",
        "name": "Infosys Mysuru to Kuvempunagar Tech Corridor",
        "source": "Infosys Mysuru Campus",
        "destination": "Kuvempunagar Complex",
        "distance": 16.5,
        "duration": 42,
        "demand": 1.25,
        "stops": [6, 4, 12, 5, 11, 3],
    },
    {
        "number": "R-109",
        "name": "Hebbal to University Campus Connect",
        "source": "Hebbal Industrial Area",
        "destination": "University of Mysore",
        "distance": 9.8,
        "duration": 26,
        "demand": 1.10,
        "stops": [4, 13, 12, 9],
    },
    {
        "number": "R-110",
        "name": "City Bus Stand to Suburban Bus Stand (Direct)",
        "source": "Mysuru City Bus Stand (CBS)",
        "destination": "Suburban Bus Stand",
        "distance": 2.5,
        "duration": 10,
        "demand": 1.50,
        "stops": [0, 8, 1],
    },
]

BUS_FLEET_DATA = [
    {"num": "KA-09-F-1201", "reg": "KA09F1201", "cap": 50, "type": "Electric AC", "route_idx": 0, "lat": 12.3250, "lng": 76.6200, "spd": 32.4},
    {"num": "KA-09-F-1202", "reg": "KA09F1202", "cap": 50, "type": "Electric AC", "route_idx": 0, "lat": 12.3500, "lng": 76.6000, "spd": 28.0},
    {"num": "KA-09-F-1203", "reg": "KA09F1203", "cap": 60, "type": "Standard Diesel", "route_idx": 1, "lat": 12.2850, "lng": 76.6620, "spd": 24.5},
    {"num": "KA-09-F-1204", "reg": "KA09F1204", "cap": 40, "type": "Mini Bus", "route_idx": 2, "lat": 12.3100, "lng": 76.6150, "spd": 30.2},
    {"num": "KA-09-F-1205", "reg": "KA09F1205", "cap": 50, "type": "Standard Diesel", "route_idx": 3, "lat": 12.3300, "lng": 76.6350, "spd": 26.8},
    {"num": "KA-09-F-1206", "reg": "KA09F1206", "cap": 30, "type": "Mini Bus", "route_idx": 4, "lat": 12.3100, "lng": 76.6380, "spd": 22.0},
    {"num": "KA-09-F-1207", "reg": "KA09F1207", "cap": 60, "type": "Standard Diesel", "route_idx": 5, "lat": 12.3150, "lng": 76.6450, "spd": 25.1},
    {"num": "KA-09-F-1208", "reg": "KA09F1208", "cap": 50, "type": "Electric AC", "route_idx": 6, "lat": 12.2950, "lng": 76.6400, "spd": 29.5},
    {"num": "KA-09-F-1209", "reg": "KA09F1209", "cap": 70, "type": "Articulated Bus", "route_idx": 7, "lat": 12.3400, "lng": 76.6100, "spd": 35.0},
    {"num": "KA-09-F-1210", "reg": "KA09F1210", "cap": 50, "type": "Standard Diesel", "route_idx": 8, "lat": 12.3350, "lng": 76.6180, "spd": 27.4},
    {"num": "KA-09-F-1211", "reg": "KA09F1211", "cap": 40, "type": "Standard Diesel", "route_idx": 9, "lat": 12.3090, "lng": 76.6560, "spd": 18.0},
    {"num": "KA-09-F-1212", "reg": "KA09F1212", "cap": 50, "type": "Electric AC", "route_idx": 0, "lat": 12.3120, "lng": 76.6400, "spd": 31.0},
    {"num": "KA-09-F-1213", "reg": "KA09F1213", "cap": 60, "type": "Standard Diesel", "route_idx": 1, "lat": 12.2900, "lng": 76.6650, "spd": 26.3},
    {"num": "KA-09-F-1214", "reg": "KA09F1214", "cap": 30, "type": "Mini Bus", "route_idx": 2, "lat": 12.3250, "lng": 76.6100, "spd": 21.5},
    {"num": "KA-09-F-1215", "reg": "KA09F1215", "cap": 50, "type": "Standard Diesel", "route_idx": 3, "lat": 12.3180, "lng": 76.6420, "spd": 28.7},
    {"num": "KA-09-F-1216", "reg": "KA09F1216", "cap": 70, "type": "Articulated Bus", "route_idx": 7, "lat": 12.3150, "lng": 76.6200, "spd": 33.2},
    {"num": "KA-09-F-1217", "reg": "KA09F1217", "cap": 40, "type": "Electric AC", "route_idx": 8, "lat": 12.3420, "lng": 76.6120, "spd": 29.8},
    {"num": "KA-09-F-1218", "reg": "KA09F1218", "cap": 50, "type": "Standard Diesel", "route_idx": 4, "lat": 12.3110, "lng": 76.6320, "spd": 23.4},
    {"num": "KA-09-F-1219", "reg": "KA09F1219", "cap": 60, "type": "Standard Diesel", "route_idx": 5, "lat": 12.3180, "lng": 76.6350, "spd": 27.1},
    {"num": "KA-09-F-1220", "reg": "KA09F1220", "cap": 50, "type": "Electric AC", "route_idx": 9, "lat": 12.3100, "lng": 76.6570, "spd": 19.5},
]


def seed_database(db: Session = None):
    close_after = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_after = True

    try:
        # Check if already seeded
        admin_check = db.query(User).filter(User.email == "admin@smartbus.demo").first()
        if admin_check:
            # Ensure passwords match demo credentials
            admin_check.hashed_password = get_password_hash("Admin@123")
            passenger_check = db.query(User).filter(User.email == "passenger@smartbus.demo").first()
            if passenger_check:
                passenger_check.hashed_password = get_password_hash("Passenger@123")

            # Refresh latest occupancy records with realistic crowding distributions for demo
            buses = db.query(Bus).all()
            now = datetime.utcnow()
            for bus in buses:
                bus_profile = bus.id % 5
                if bus_profile == 0:
                    ratio = random.uniform(1.04, 1.15)   # OVERCROWDED (>100%)
                    cat = "OVERCROWDED"
                elif bus_profile == 1:
                    ratio = random.uniform(0.92, 0.98)   # NEAR FULL (91-100%)
                    cat = "NEAR_FULL"
                elif bus_profile == 2:
                    ratio = random.uniform(0.74, 0.88)   # HIGH (71-90%)
                    cat = "HIGH"
                elif bus_profile == 3:
                    ratio = random.uniform(0.48, 0.65)   # MODERATE (41-70%)
                    cat = "MODERATE"
                else:
                    ratio = random.uniform(0.25, 0.38)   # LOW (0-40%)
                    cat = "LOW"

                passengers = int(bus.capacity * ratio)
                occ_pct = round((passengers / bus.capacity) * 100, 1)

                rec = OccupancyRecord(
                    bus_id=bus.id,
                    route_id=bus.current_route_id or 1,
                    timestamp=now,
                    passenger_count=passengers,
                    capacity=bus.capacity,
                    occupancy_percentage=occ_pct,
                    status=cat,
                )
                db.add(rec)

            db.commit()
            print("Database already seeded. Demo credentials and live high-crowding fleet records refreshed.")
            return

        print("Seeding database...")

        # 1. Seed Users
        admin_user = User(
            email="admin@smartbus.demo",
            hashed_password=get_password_hash("Admin@123"),
            full_name="Transport Authority Admin",
            role="admin",
            phone="+91 821 2419001",
            is_active=True,
        )
        passenger_user = User(
            email="passenger@smartbus.demo",
            hashed_password=get_password_hash("Passenger@123"),
            full_name="Priya Sharma",
            role="passenger",
            phone="+91 98450 12345",
            is_active=True,
        )
        db.add(admin_user)
        db.add(passenger_user)
        db.flush()

        # 2. Seed Stops
        created_stops = []
        for stop_info in MYSURU_STOPS:
            stop = BusStop(
                stop_name=stop_info["name"],
                location_name=stop_info["location"],
                latitude=stop_info["lat"],
                longitude=stop_info["lng"],
            )
            db.add(stop)
            created_stops.append(stop)
        db.flush()

        # 3. Seed Routes and RouteStops
        created_routes = []
        for r_data in ROUTES_CONFIG:
            route = Route(
                route_number=r_data["number"],
                route_name=r_data["name"],
                source=r_data["source"],
                destination=r_data["destination"],
                total_distance_km=r_data["distance"],
                estimated_duration_mins=r_data["duration"],
                base_demand=r_data["demand"],
                is_active=True,
            )
            db.add(route)
            db.flush()
            created_routes.append(route)

            # Add RouteStops
            for seq, stop_idx in enumerate(r_data["stops"]):
                dist = round((seq / max(1, len(r_data["stops"]) - 1)) * r_data["distance"], 1)
                dur = round((seq / max(1, len(r_data["stops"]) - 1)) * r_data["duration"])
                route_stop = RouteStop(
                    route_id=route.id,
                    stop_id=created_stops[stop_idx].id,
                    stop_sequence=seq + 1,
                    distance_from_source_km=dist,
                    estimated_time_mins=dur,
                )
                db.add(route_stop)

        # 4. Seed Buses
        created_buses = []
        for b_data in BUS_FLEET_DATA:
            route_id = created_routes[b_data["route_idx"]].id
            bus = Bus(
                bus_number=b_data["num"],
                registration_number=b_data["reg"],
                capacity=b_data["cap"],
                bus_type=b_data["type"],
                status="active",
                current_route_id=route_id,
                latitude=b_data["lat"],
                longitude=b_data["lng"],
                speed_kmh=b_data["spd"],
                updated_at=datetime.utcnow(),
            )
            db.add(bus)
            created_buses.append(bus)
        db.flush()

        # 5. Seed Historical Occupancy Records
        now = datetime.utcnow()
        for bus in created_buses:
            bus_profile = bus.id % 5
            for hours_back in range(12, 0, -2):
                timestamp = now - timedelta(hours=hours_back)
                if bus_profile == 0:
                    ratio = random.uniform(1.04, 1.16)   # OVERCROWDED
                elif bus_profile == 1:
                    ratio = random.uniform(0.92, 0.98)   # NEAR FULL
                elif bus_profile == 2:
                    ratio = random.uniform(0.74, 0.88)   # HIGH
                elif bus_profile == 3:
                    ratio = random.uniform(0.48, 0.65)   # MODERATE
                else:
                    ratio = random.uniform(0.24, 0.38)   # LOW

                passengers = int(bus.capacity * ratio)
                occ_pct = round((passengers / bus.capacity) * 100, 1)

                if occ_pct <= 40:
                    status_cat = "LOW"
                elif occ_pct <= 70:
                    status_cat = "MODERATE"
                elif occ_pct <= 90:
                    status_cat = "HIGH"
                elif occ_pct <= 100:
                    status_cat = "NEAR_FULL"
                else:
                    status_cat = "OVERCROWDED"

                record = OccupancyRecord(
                    bus_id=bus.id,
                    route_id=bus.current_route_id,
                    timestamp=timestamp,
                    passenger_count=passengers,
                    capacity=bus.capacity,
                    occupancy_percentage=occ_pct,
                    status=status_cat,
                )
                db.add(record)

        # 6. Seed Model Metrics from artifacts/metrics.json if exists
        metrics_file = "ml/artifacts/metrics.json"
        if os.path.exists(metrics_file):
            with open(metrics_file, "r") as f:
                metrics_data = json.load(f)
            metric_entry = ModelMetric(
                model_name=metrics_data.get("model_name", "Random Forest Regressor"),
                mae=metrics_data.get("mae", 2.10),
                rmse=metrics_data.get("rmse", 2.66),
                r2_score=metrics_data.get("r2_score", 0.9654),
                training_samples=metrics_data.get("train_samples", 16320),
                test_samples=metrics_data.get("test_samples", 4080),
                feature_importance_json=json.dumps(metrics_data.get("feature_importances", [])),
                trained_at=datetime.utcnow(),
            )
            db.add(metric_entry)

        db.commit()
        print("Database successfully initialized and seeded with Mysuru transit system data.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_after:
            db.close()


if __name__ == "__main__":
    seed_database()
