import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.session import engine, Base
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


# ---------------------------------------------------------------------------
# Database initialisation
# ---------------------------------------------------------------------------
# create_all is safe to call on every cold start: it is a no-op when the
# schema already exists.  On Vercel serverless the write-able path is /tmp,
# so SQLite users must point DATABASE_URL there via the env var.
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# Lifespan (replaces deprecated @app.on_event("startup"))
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Seed the database exactly once per deployment, not on every cold-start
    invocation.  We use a lightweight sentinel environment variable
    SMARTBUS_SEEDED that is set inside the process after the first successful
    seed.  Because Vercel isolates each function execution in its own process,
    the seed still runs once per cold-start, but the seed_database() function
    itself is idempotent: it checks for the admin user row before writing and
    only refreshes occupancy records if the DB is already populated.
    """
    if not os.environ.get("SMARTBUS_SEEDED"):
        try:
            seed_database()
            os.environ["SMARTBUS_SEEDED"] = "1"
        except Exception as e:
            # Log and continue — a seeding failure must not block serving requests.
            print(f"[startup] seed notice: {e}")
    yield
    # No teardown required for stateless serverless functions.


# ---------------------------------------------------------------------------
# Application factory
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "SmartBus AI: Cloud-Based Smart Public Bus Occupancy Prediction System. "
        "Academic Cloud Computing project for SDG 11 (Sustainable Cities and Communities)."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
# Allow origins are driven entirely by settings.BACKEND_CORS_ORIGINS.
# In production set the BACKEND_CORS_ORIGINS env var to an explicit list —
# never leave wildcard "*" in a production deployment.
#
# When ENVIRONMENT == "production" and the list still contains "*" we strip it
# and emit a warning so the app keeps working but avoids an open CORS policy.
_cors_origins = list(settings.BACKEND_CORS_ORIGINS)

if settings.ENVIRONMENT == "production" and "*" in _cors_origins:
    print(
        "[WARNING] BACKEND_CORS_ORIGINS contains '*' in production. "
        "Wildcard is being removed. Set BACKEND_CORS_ORIGINS explicitly."
    )
    _cors_origins = [o for o in _cors_origins if o != "*"]

# If the list is empty after stripping, fall back to a safe empty deny-all
# rather than accidentally opening up everything.
_allow_credentials = True
if "*" in _cors_origins:
    # Browser spec: credentials cannot be sent when origin is "*"
    _allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
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


app.include_router(auth.router,        prefix=settings.API_V1_STR)
app.include_router(buses.router,       prefix=settings.API_V1_STR)
app.include_router(routes.router,      prefix=settings.API_V1_STR)
app.include_router(stops.router,       prefix=settings.API_V1_STR)
app.include_router(occupancy.router,   prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router,   prefix=settings.API_V1_STR)
app.include_router(reports.router,     prefix=settings.API_V1_STR)
app.include_router(users.router,       prefix=settings.API_V1_STR)


# ---------------------------------------------------------------------------
# Local development entry-point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
