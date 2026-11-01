from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel


class BusStopResponse(BaseModel):
    id: int
    stop_name: str
    location_name: str
    latitude: float
    longitude: float

    class Config:
        from_attributes = True


class RouteStopResponse(BaseModel):
    id: int
    stop_sequence: int
    distance_from_source_km: float
    estimated_time_mins: int
    stop: BusStopResponse

    class Config:
        from_attributes = True


class RouteBase(BaseModel):
    route_number: str
    route_name: str
    source: str
    destination: str
    total_distance_km: float = 15.0
    estimated_duration_mins: int = 45
    base_demand: float = 1.2
    is_active: bool = True


class RouteCreate(RouteBase):
    pass


class RouteUpdate(BaseModel):
    route_name: Optional[str] = None
    source: Optional[str] = None
    destination: Optional[str] = None
    total_distance_km: Optional[float] = None
    estimated_duration_mins: Optional[int] = None
    is_active: Optional[bool] = None


class RouteResponse(RouteBase):
    id: int
    created_at: datetime
    route_stops: List[RouteStopResponse] = []

    class Config:
        from_attributes = True


class BusBase(BaseModel):
    bus_number: str
    registration_number: str
    capacity: int = 50
    bus_type: str = "Standard"
    status: str = "active"
    current_route_id: Optional[int] = None


class BusCreate(BusBase):
    pass


class BusUpdate(BaseModel):
    capacity: Optional[int] = None
    bus_type: Optional[str] = None
    status: Optional[str] = None
    current_route_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    speed_kmh: Optional[float] = None


class BusResponse(BusBase):
    id: int
    latitude: float
    longitude: float
    speed_kmh: float
    updated_at: datetime
    route: Optional[RouteBase] = None

    class Config:
        from_attributes = True


class OccupancyRecordResponse(BaseModel):
    id: int
    bus_id: int
    route_id: int
    timestamp: datetime
    passenger_count: int
    capacity: int
    occupancy_percentage: float
    status: str

    class Config:
        from_attributes = True
