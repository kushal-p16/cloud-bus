from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.session import get_db
from app.models.transit import PassengerSearch, FavoriteRoute, Route
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/searches")
def get_user_search_history(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    searches = (
        db.query(PassengerSearch)
        .filter(PassengerSearch.user_id == current_user.id)
        .order_by(PassengerSearch.searched_at.desc())
        .limit(limit)
        .all()
    )
    return searches


@router.get("/favorites")
def get_user_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favs = (
        db.query(FavoriteRoute)
        .filter(FavoriteRoute.user_id == current_user.id)
        .all()
    )
    route_ids = [f.route_id for f in favs]
    routes = db.query(Route).filter(Route.id.in_(route_ids)).all() if route_ids else []
    return routes


@router.post("/favorites/{route_id}")
def add_favorite_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    existing = (
        db.query(FavoriteRoute)
        .filter(FavoriteRoute.user_id == current_user.id, FavoriteRoute.route_id == route_id)
        .first()
    )
    if existing:
        return {"status": "already_favorite", "route_id": route_id}

    fav = FavoriteRoute(user_id=current_user.id, route_id=route_id)
    db.add(fav)
    db.commit()
    return {"status": "added", "route_id": route_id}


@router.delete("/favorites/{route_id}")
def remove_favorite_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    fav = (
        db.query(FavoriteRoute)
        .filter(FavoriteRoute.user_id == current_user.id, FavoriteRoute.route_id == route_id)
        .first()
    )
    if fav:
        db.delete(fav)
        db.commit()
    return {"status": "removed", "route_id": route_id}
