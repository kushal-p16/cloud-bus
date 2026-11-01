import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.transit import Bus, Route, OccupancyRecord
from app.schemas.transit import OccupancyRecordResponse
from ml.predict import predictor

router = APIRouter(prefix="/occupancy", tags=["Occupancy Monitoring"])


@router.get("/current")
def get_current_occupancies(
    route_id: Optional[int] = None,
    occupancy_level: Optional[str] = None,
    db: Session = Depends(get_db),
):
    buses = db.query(Bus).options(joinedload(Bus.route)).filter(Bus.status == "active").all()
    results = []

    for bus in buses:
        if route_id and bus.current_route_id != route_id:
            continue

        latest = (
            db.query(OccupancyRecord)
            .filter(OccupancyRecord.bus_id == bus.id)
            .order_by(OccupancyRecord.timestamp.desc())
            .first()
        )

        passengers = latest.passenger_count if latest else int(bus.capacity * 0.45)
        pct = latest.occupancy_percentage if latest else 45.0
        status = latest.status if latest else "MODERATE"

        if occupancy_level and status != occupancy_level:
            continue

        results.append({
            "bus_id": bus.id,
            "bus_number": bus.bus_number,
            "registration_number": bus.registration_number,
            "route_id": bus.current_route_id,
            "route_number": bus.route.route_number if bus.route else "N/A",
            "route_name": bus.route.route_name if bus.route else "Unassigned",
            "capacity": bus.capacity,
            "current_passenger_count": passengers,
            "occupancy_percentage": pct,
            "occupancy_status": status,
            "speed_kmh": bus.speed_kmh,
            "latitude": bus.latitude,
            "longitude": bus.longitude,
            "last_updated": latest.timestamp.strftime("%H:%M:%S") if latest else datetime.utcnow().strftime("%H:%M:%S"),
        })

    return results


@router.post("/telemetry-tick")
def trigger_telemetry_tick(db: Session = Depends(get_db)):
    """
    Simulates incoming telemetry tick for active buses:
    drifts GPS along route and simulates passenger boarding/alighting with the ML model.
    """
    buses = db.query(Bus).filter(Bus.status == "active").all()
    now = datetime.utcnow()
    current_hour = now.hour
    day_of_week = now.weekday()

    updated = 0
    for bus in buses:
        # Subtle coordinate drift (simulating movement)
        bus.latitude += random.uniform(-0.0015, 0.0015)
        bus.longitude += random.uniform(-0.0015, 0.0015)
        bus.speed_kmh = round(random.uniform(18.0, 42.0), 1)
        bus.updated_at = now

        # Use ML prediction with small sensory noise for dynamic simulation
        route_id = bus.current_route_id or 1
        route = db.query(Route).filter(Route.id == route_id).first()
        base_demand = route.base_demand if route else 1.2

        pred = predictor.predict(
            bus_id=bus.id,
            route_id=route_id,
            hour=current_hour,
            day_of_week=day_of_week,
            bus_capacity=bus.capacity,
            historical_route_demand=base_demand,
        )

        # Fluctuate passenger count slightly
        passengers = max(0, min(int(bus.capacity * 1.2), pred["predicted_passenger_count"] + random.randint(-4, 4)))
        occ_pct = round((passengers / bus.capacity) * 100, 1)

        if occ_pct <= 40:
            category = "LOW"
        elif occ_pct <= 70:
            category = "MODERATE"
        elif occ_pct <= 90:
            category = "HIGH"
        elif occ_pct <= 100:
            category = "NEAR_FULL"
        else:
            category = "OVERCROWDED"

        rec = OccupancyRecord(
            bus_id=bus.id,
            route_id=route_id,
            timestamp=now,
            passenger_count=passengers,
            capacity=bus.capacity,
            occupancy_percentage=occ_pct,
            status=category,
        )
        db.add(rec)
        updated += 1

    db.commit()
    return {"status": "success", "buses_updated": updated, "timestamp": now.isoformat()}
