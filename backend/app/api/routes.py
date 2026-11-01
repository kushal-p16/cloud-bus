from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.transit import Route, RouteStop, BusStop
from app.models.user import User
from app.schemas.transit import RouteCreate, RouteUpdate, RouteResponse
from app.api.deps import get_current_active_admin

router = APIRouter(prefix="/routes", tags=["Routes"])


@router.get("", response_model=List[RouteResponse])
def get_routes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    routes = (
        db.query(Route)
        .options(
            joinedload(Route.route_stops).joinedload(RouteStop.stop)
        )
        .offset(skip)
        .limit(limit)
        .all()
    )
    return routes


@router.get("/{route_id}", response_model=RouteResponse)
def get_route_by_id(route_id: int, db: Session = Depends(get_db)):
    route = (
        db.query(Route)
        .options(
            joinedload(Route.route_stops).joinedload(RouteStop.stop)
        )
        .filter(Route.id == route_id)
        .first()
    )
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@router.post("", response_model=RouteResponse, status_code=status.HTTP_201_CREATED)
def create_route(
    route_in: RouteCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    existing = db.query(Route).filter(Route.route_number == route_in.route_number.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="A route with this number already exists")

    route = Route(
        route_number=route_in.route_number.strip(),
        route_name=route_in.route_name.strip(),
        source=route_in.source.strip(),
        destination=route_in.destination.strip(),
        total_distance_km=route_in.total_distance_km,
        estimated_duration_mins=route_in.estimated_duration_mins,
        base_demand=route_in.base_demand,
        is_active=route_in.is_active,
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    return route


@router.put("/{route_id}", response_model=RouteResponse)
def update_route(
    route_id: int,
    route_update: RouteUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    update_data = route_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(route, field, value)

    db.commit()
    db.refresh(route)
    return route


@router.delete("/{route_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_route(
    route_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin),
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    db.delete(route)
    db.commit()
    return None
