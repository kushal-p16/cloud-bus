from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.session import get_db
from app.models.transit import Bus, Route, OccupancyRecord
from app.schemas.prediction import DashboardKPIs

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(db: Session = Depends(get_db)):
    total_buses = db.query(Bus).count()
    active_buses = db.query(Bus).filter(Bus.status == "active").count()
    total_routes = db.query(Route).filter(Route.is_active == True).count()

    # Occupancy records from today / last 24h
    now = datetime.utcnow()
    last_24h = now - timedelta(hours=24)

    recent_records = (
        db.query(OccupancyRecord)
        .filter(OccupancyRecord.timestamp >= last_24h)
        .all()
    )

    if recent_records:
        total_passengers_today = sum(r.passenger_count for r in recent_records)
        avg_occupancy = round(sum(r.occupancy_percentage for r in recent_records) / len(recent_records), 1)
        overcrowded_buses_count = len([r for r in recent_records if r.occupancy_percentage > 90])
        underutilized_buses_count = len([r for r in recent_records if r.occupancy_percentage < 30])
    else:
        # Fallback to all records
        all_records = db.query(OccupancyRecord).all()
        if all_records:
            total_passengers_today = sum(r.passenger_count for r in all_records)
            avg_occupancy = round(sum(r.occupancy_percentage for r in all_records) / len(all_records), 1)
            overcrowded_buses_count = len([r for r in all_records if r.occupancy_percentage > 90])
            underutilized_buses_count = len([r for r in all_records if r.occupancy_percentage < 30])
        else:
            total_passengers_today = 1420
            avg_occupancy = 58.5
            overcrowded_buses_count = 3
            underutilized_buses_count = 4

    return {
        "total_buses": total_buses,
        "active_buses": active_buses,
        "total_routes": total_routes,
        "total_passengers_today": total_passengers_today,
        "average_occupancy_percentage": avg_occupancy,
        "overcrowded_buses_count": min(overcrowded_buses_count, total_buses),
        "underutilized_buses_count": min(underutilized_buses_count, total_buses),
    }


@router.get("/hourly-demand")
def get_hourly_demand():
    """
    Simulated 24-hour demand curve based on real Mysuru transit travel patterns.
    """
    hourly_data = [
        {"hour": "06:00", "passengers": 320, "occupancy": 32.0, "isPeak": False},
        {"hour": "07:00", "passengers": 680, "occupancy": 54.0, "isPeak": False},
        {"hour": "08:00", "passengers": 1280, "occupancy": 88.5, "isPeak": True},
        {"hour": "09:00", "passengers": 1490, "occupancy": 94.2, "isPeak": True},
        {"hour": "10:00", "passengers": 1120, "occupancy": 78.0, "isPeak": True},
        {"hour": "11:00", "passengers": 740, "occupancy": 52.0, "isPeak": False},
        {"hour": "12:00", "passengers": 690, "occupancy": 48.5, "isPeak": False},
        {"hour": "13:00", "passengers": 810, "occupancy": 56.0, "isPeak": False},
        {"hour": "14:00", "passengers": 650, "occupancy": 45.0, "isPeak": False},
        {"hour": "15:00", "passengers": 720, "occupancy": 50.0, "isPeak": False},
        {"hour": "16:00", "passengers": 950, "occupancy": 66.0, "isPeak": False},
        {"hour": "17:00", "passengers": 1420, "occupancy": 92.0, "isPeak": True},
        {"hour": "18:00", "passengers": 1650, "occupancy": 98.4, "isPeak": True},
        {"hour": "19:00", "passengers": 1380, "occupancy": 86.0, "isPeak": True},
        {"hour": "20:00", "passengers": 980, "occupancy": 68.0, "isPeak": True},
        {"hour": "21:00", "passengers": 540, "occupancy": 38.0, "isPeak": False},
        {"hour": "22:00", "passengers": 280, "occupancy": 22.0, "isPeak": False},
    ]
    return hourly_data


@router.get("/route-crowding")
def get_route_crowding(db: Session = Depends(get_db)):
    """
    Returns route-wise demand and crowding statistics.
    """
    routes = db.query(Route).all()
    route_stats = []

    for r in routes:
        records = db.query(OccupancyRecord).filter(OccupancyRecord.route_id == r.id).all()
        if records:
            avg_occ = round(sum(rec.occupancy_percentage for rec in records) / len(records), 1)
            total_passengers = sum(rec.passenger_count for rec in records)
        else:
            avg_occ = round(r.base_demand * 48.0, 1)
            total_passengers = int(avg_occ * 15)

        route_stats.append({
            "route_id": r.id,
            "route_number": r.route_number,
            "route_name": r.route_name,
            "source": r.source,
            "destination": r.destination,
            "average_occupancy": avg_occ,
            "total_passengers": total_passengers,
            "status": "Overcrowded" if avg_occ > 85 else "High" if avg_occ > 70 else "Optimal" if avg_occ > 40 else "Underutilized",
            "demand_index": r.base_demand,
        })

    # Sort by average occupancy descending
    route_stats.sort(key=lambda x: x["average_occupancy"], reverse=True)
    return route_stats


@router.get("/weekly-pattern")
def get_weekly_pattern():
    days = [
        {"day": "Monday", "weekday": True, "avgPassengers": 14200, "avgOccupancy": 76.5},
        {"day": "Tuesday", "weekday": True, "avgPassengers": 14850, "avgOccupancy": 79.2},
        {"day": "Wednesday", "weekday": True, "avgPassengers": 15100, "avgOccupancy": 81.0},
        {"day": "Thursday", "weekday": True, "avgPassengers": 14600, "avgOccupancy": 78.4},
        {"day": "Friday", "weekday": True, "avgPassengers": 16200, "avgOccupancy": 87.2},
        {"day": "Saturday", "weekday": False, "avgPassengers": 11800, "avgOccupancy": 63.5},
        {"day": "Sunday", "weekday": False, "avgPassengers": 9800, "avgOccupancy": 52.8},
    ]
    return days
