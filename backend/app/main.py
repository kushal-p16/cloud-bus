import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import engine, Base, get_db
from app.database.seed import seed_database
from app.api import (
    auth,
    buses,
    routes,
    stops,
    occupancy,
    predictions,
    analytics,
    reports,
    users,
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SmartBus AI: Cloud-Based Smart Public Bus Occupancy Prediction System. Academic Cloud Computing project for SDG 11 (Sustainable Cities and Communities).",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless development & demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    # Ensure database is seeded with demo accounts and Mysuru transit routes
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")


@app.get("/health", tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "SmartBus AI Backend",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "sdg_target": "SDG 11.2 - Sustainable Cities and Accessible Transport",
    }


# Include Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(buses.router, prefix=settings.API_V1_STR)
app.include_router(routes.router, prefix=settings.API_V1_STR)
app.include_router(stops.router, prefix=settings.API_V1_STR)
app.include_router(occupancy.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
