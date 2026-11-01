from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.transit import Bus, Route, OccupancyRecord
from app.models.user import User
from app.schemas.transit import BusCreate, BusUpdate, BusResponse
from app.api.deps import get_current_user, get_current_active_admin

router = APIRouter(prefix="/buses", tags=["Buses"])


@router.get("", response_model=List[BusResponse])
def get_buses(
    route_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Bus).options(joinedload(Bus.route))
    if route_id:
        query = query.filter(Bus.current_route_id == route_id)
    if status:
        query = query.filter(Bus.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/live-locations")
def get_live_bus_locations(db: Session = Depends(get_db)):
    """
    Returns live coordinates, status, and latest occupancy for map tracking.
    Clearly labeled as simulated telemetry.
    """
    buses = db.query(Bus).options(joinedload(Bus.route)).all()
    results = []
    for b in buses:
        # Get latest occupancy record
        latest_occ = (
            db.query(OccupancyRecord)
            .filter(OccupancyRecord.bus_id == b.id)
            .order_by(OccupancyRecord.timestamp.desc())
            .first()
        )
        results.append({
            "bus_id": b.id,
            "bus_number": b.bus_number,
            "registration_number": b.registration_number,
            "capacity": b.capacity,
            "bus_type": b.bus_type,
            "status": b.status,
            "latitude": b.latitude,
            "longitude": b.longitude,
            "speed_kmh": b.speed_kmh,
            "route_id": b.current_route_id,
            "route_name": b.route.route_name if b.route else "Unassigned",
            "route_number": b.route.route_number if b.route else "N/A",
            "current_passengers": latest_occ.passenger_count if latest_occ else int(b.capacity * 0.4),
            "occupancy_percentage": latest_occ.occupancy_percentage if latest_occ else 40.0,
            "occupancy_category": latest_occ.status if latest_occ else "LOW",
            "is_simulated": True,
            "updated_at": b.updated_at.isoformat(),
        })
    return results


@router.get("/{bus_id}", response_model=BusResponse)
def get_bus_by_id(bus_id: int, db: Session = Depends(get_db)):
    bus = db.query(Bus).options(joinedload(Bus.route)).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    return bus


@router.post("", response_model=BusResponse, status_code=status.HTTP_201_CREATED)
def create_bus(
    bus_in: BusCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    existing = db.query(Bus).filter(Bus.bus_number == bus_in.bus_number.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A bus with this number already exists")

    bus = Bus(
        bus_number=bus_in.bus_number.strip(),
        registration_number=bus_in.registration_number.strip(),
        capacity=bus_in.capacity,
        bus_type=bus_in.bus_type,
        status=bus_in.status,
        current_route_id=bus_in.current_route_id,
        latitude=12.3080,
        longitude=76.6548,
        speed_kmh=0.0,
        updated_at=datetime.utcnow(),
    )
    db.add(bus)
    db.commit()
    db.refresh(bus)
    return bus


@router.put("/{bus_id}", response_model=BusResponse)
def update_bus(
    bus_id: int,
    bus_update: BusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")

    update_data = bus_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bus, field, value)

    bus.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(bus)
    return bus


@router.delete("/{bus_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bus(
    bus_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    bus = db.query(Bus).filter(Bus.id == bus_id).first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")

    # Remove associated occupancy records
    db.query(OccupancyRecord).filter(OccupancyRecord.bus_id == bus_id).delete()
    db.delete(bus)
    db.commit()
    return None
