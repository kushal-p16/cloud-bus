import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.transit import Bus, Route, OccupancyRecord
from app.models.user import User
from app.api.deps import get_current_active_admin

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/summary")
def get_reports_summary(db: Session = Depends(get_db)):
    """
    Returns summary statistics for the 4 core reports.
    """
    buses_count = db.query(Bus).count()
    routes_count = db.query(Route).count()
    records_count = db.query(OccupancyRecord).count()

    return {
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "city": "Mysuru City Transit Network",
        "available_reports": [
            {
                "id": "daily-occupancy",
                "name": "Daily Occupancy Report",
                "description": "Hourly fleet passenger load, peak crowding rates, and capacity threshold violations.",
                "total_records": records_count,
            },
            {
                "id": "route-utilization",
                "name": "Route Utilization Report",
                "description": "Passenger distribution across corridors, underserved vs saturated transit lines.",
                "total_records": routes_count,
            },
            {
                "id": "bus-performance",
                "name": "Bus Performance & Fleet Health",
                "description": "Vehicle telemetry, speed averages, active route assignments, and capacity usage.",
                "total_records": buses_count,
            },
            {
                "id": "passenger-demand",
                "name": "Passenger Demand Forecast Report",
                "description": "AI predicted demand curve, morning/evening peak analysis, and SDG 11 metrics.",
                "total_records": 24,
            },
        ],
    }


@router.get("/download/{report_type}")
def download_csv_report(
    report_type: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "daily-occupancy":
        writer.writerow(["Record ID", "Bus Number", "Route Name", "Timestamp", "Passengers", "Capacity", "Occupancy %", "Status"])
        records = db.query(OccupancyRecord).order_by(OccupancyRecord.timestamp.desc()).limit(200).all()
        for r in records:
            bus_num = r.bus.bus_number if r.bus else f"Bus #{r.bus_id}"
            route_name = r.route.route_name if r.route else f"Route #{r.route_id}"
            writer.writerow([r.id, bus_num, route_name, r.timestamp.isoformat(), r.passenger_count, r.capacity, r.occupancy_percentage, r.status])
        filename = f"SmartBus_Daily_Occupancy_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    elif report_type == "route-utilization":
        writer.writerow(["Route Number", "Route Name", "Source", "Destination", "Distance (km)", "Est Duration (mins)", "Demand Index", "Active Status"])
        routes = db.query(Route).all()
        for rt in routes:
            writer.writerow([rt.route_number, rt.route_name, rt.source, rt.destination, rt.total_distance_km, rt.estimated_duration_mins, rt.base_demand, "Active" if rt.is_active else "Inactive"])
        filename = f"SmartBus_Route_Utilization_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    elif report_type == "bus-performance":
        writer.writerow(["Bus Number", "Registration Number", "Type", "Capacity", "Status", "Speed (km/h)", "Latitude", "Longitude", "Assigned Route"])
        buses = db.query(Bus).all()
        for b in buses:
            route_name = b.route.route_name if b.route else "Unassigned"
            writer.writerow([b.bus_number, b.registration_number, b.bus_type, b.capacity, b.status, b.speed_kmh, b.latitude, b.longitude, route_name])
        filename = f"SmartBus_Fleet_Performance_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    elif report_type == "passenger-demand":
        writer.writerow(["Hour", "Expected Passengers", "Avg Occupancy %", "Peak Indicator", "Optimal Fleet Size"])
        hourly = [
            ("06:00", 320, 32.0, "No", 8),
            ("07:00", 680, 54.0, "No", 12),
            ("08:00", 1280, 88.5, "Yes - Morning Peak", 20),
            ("09:00", 1490, 94.2, "Yes - Morning Peak", 20),
            ("10:00", 1120, 78.0, "Yes - Peak Transition", 16),
            ("11:00", 740, 52.0, "No", 12),
            ("12:00", 690, 48.5, "No", 10),
            ("13:00", 810, 56.0, "No", 12),
            ("14:00", 650, 45.0, "No", 10),
            ("15:00", 720, 50.0, "No", 12),
            ("16:00", 950, 66.0, "No", 15),
            ("17:00", 1420, 92.0, "Yes - Evening Peak", 20),
            ("18:00", 1650, 98.4, "Yes - Evening Peak", 20),
            ("19:00", 1380, 86.0, "Yes - Evening Peak", 18),
            ("20:00", 980, 68.0, "Yes - Peak Transition", 14),
            ("21:00", 540, 38.0, "No", 8),
            ("22:00", 280, 22.0, "No", 6),
        ]
        for row in hourly:
            writer.writerow(row)
        filename = f"SmartBus_Demand_Forecast_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    else:
        raise HTTPException(status_code=400, detail="Unknown report type requested")

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
