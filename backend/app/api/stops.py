from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.transit import BusStop
from app.schemas.transit import BusStopResponse

router = APIRouter(prefix="/stops", tags=["Bus Stops"])


@router.get("", response_model=List[BusStopResponse])
def get_bus_stops(db: Session = Depends(get_db)):
    return db.query(BusStop).order_by(BusStop.stop_name).all()
