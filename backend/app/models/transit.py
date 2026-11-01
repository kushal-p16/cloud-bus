from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base


class BusStop(Base):
    __tablename__ = "bus_stops"

    id = Column(Integer, primary_key=True, index=True)
    stop_name = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    route_stops = relationship("RouteStop", back_populates="stop")


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    route_number = Column(String(50), unique=True, index=True, nullable=False)
    route_name = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    total_distance_km = Column(Float, default=15.0)
    estimated_duration_mins = Column(Integer, default=45)
    base_demand = Column(Float, default=1.2)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    buses = relationship("Bus", back_populates="route")
    route_stops = relationship("RouteStop", back_populates="route", cascade="all, delete-orphan", order_by="RouteStop.stop_sequence")
    occupancy_records = relationship("OccupancyRecord", back_populates="route")


class RouteStop(Base):
    __tablename__ = "route_stops"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    stop_id = Column(Integer, ForeignKey("bus_stops.id"), nullable=False)
    stop_sequence = Column(Integer, nullable=False)
    distance_from_source_km = Column(Float, default=0.0)
    estimated_time_mins = Column(Integer, default=0)

    route = relationship("Route", back_populates="route_stops")
    stop = relationship("BusStop", back_populates="route_stops")


class Bus(Base):
    __tablename__ = "buses"

    id = Column(Integer, primary_key=True, index=True)
    bus_number = Column(String(50), unique=True, index=True, nullable=False)
    registration_number = Column(String(50), unique=True, nullable=False)
    capacity = Column(Integer, default=50, nullable=False)
    bus_type = Column(String(50), default="Standard")  # Standard, AC Electric, Mini Bus, Articulated
    status = Column(String(50), default="active")      # active, inactive, maintenance
    current_route_id = Column(Integer, ForeignKey("routes.id"), nullable=True)
    
    # Telemetry simulation
    latitude = Column(Float, default=12.3051)
    longitude = Column(Float, default=76.6551)
    speed_kmh = Column(Float, default=28.5)
    updated_at = Column(DateTime, default=datetime.utcnow)

    route = relationship("Route", back_populates="buses")
    occupancy_records = relationship("OccupancyRecord", back_populates="bus")


class OccupancyRecord(Base):
    __tablename__ = "occupancy_records"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    passenger_count = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False)
    occupancy_percentage = Column(Float, nullable=False)
    status = Column(String(50), nullable=False)  # LOW, MODERATE, HIGH, NEAR_FULL, OVERCROWDED

    bus = relationship("Bus", back_populates="occupancy_records")
    route = relationship("Route", back_populates="occupancy_records")


class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    bus_id = Column(Integer, ForeignKey("buses.id"), nullable=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    travel_date = Column(String(20), nullable=False)
    travel_hour = Column(Integer, nullable=False)
    predicted_passenger_count = Column(Integer, nullable=False)
    predicted_occupancy_percentage = Column(Float, nullable=False)
    occupancy_category = Column(String(50), nullable=False)
    actual_passenger_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PassengerSearch(Base):
    __tablename__ = "passenger_searches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    source = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    travel_date = Column(String(20), nullable=False)
    searched_at = Column(DateTime, default=datetime.utcnow)


class FavoriteRoute(Base):
    __tablename__ = "favorite_routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    r2_score = Column(Float, nullable=False)
    training_samples = Column(Integer, nullable=False)
    test_samples = Column(Integer, nullable=False)
    feature_importance_json = Column(Text, nullable=True)
    trained_at = Column(DateTime, default=datetime.utcnow)
