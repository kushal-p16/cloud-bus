from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class PredictionRequest(BaseModel):
    bus_id: Optional[int] = 1
    route_id: int
    travel_date: Optional[str] = None  # YYYY-MM-DD
    travel_hour: int                   # 6 to 22
    bus_capacity: Optional[int] = 50
    historical_route_demand: Optional[float] = 1.2
    previous_passenger_count: Optional[int] = None
    previous_stop_passenger_count: Optional[int] = None


class PredictionResponse(BaseModel):
    bus_id: Optional[int] = None
    bus_number: Optional[str] = None
    route_id: int
    route_name: Optional[str] = None
    travel_date: str
    travel_hour: int
    predicted_passenger_count: int
    bus_capacity: int
    occupancy_percentage: float
    occupancy_category: str
    badge_color: str
    crowd_level_text: str
    is_peak_hour: bool
    features_used: Dict[str, Any]
    estimated_arrival: Optional[str] = None


class BusSearchResult(BaseModel):
    bus_id: int
    bus_number: str
    registration_number: str
    route_id: int
    route_number: str
    route_name: str
    source: str
    destination: str
    bus_capacity: int
    bus_type: str
    estimated_arrival_mins: int
    predicted_passenger_count: int
    occupancy_percentage: float
    occupancy_category: str
    badge_color: str
    crowd_level_text: str
    is_recommended: bool = False
    last_updated: str


class SearchQuery(BaseModel):
    source: str
    destination: str
    travel_date: Optional[str] = None
    travel_hour: Optional[int] = None


class ModelMetricResponse(BaseModel):
    model_name: str
    algorithm: str
    trained_at: str
    train_samples: int
    test_samples: int
    mae: float
    rmse: float
    r2_score: float
    feature_importances: List[Dict[str, Any]]
    features: List[str]


class DashboardKPIs(BaseModel):
    total_buses: int
    active_buses: int
    total_routes: int
    total_passengers_today: int
    average_occupancy_percentage: float
    overcrowded_buses_count: int
    underutilized_buses_count: int
