from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# ---------------------------------------------------------------------------
# Engine configuration
# ---------------------------------------------------------------------------
# Serverless environments (Vercel, AWS Lambda) must NOT use persistent
# connection pools because each function instance is short-lived and there is
# no guarantee a connection borrowed by a previous invocation is still alive.
#
# Strategy:
#   SQLite   – single-threaded check disabled; no pooling concerns.
#   Postgres – use NullPool so every request opens and immediately closes its
#              own connection. This prevents "SSL connection has been closed
#              unexpectedly" errors on Vercel and similar platforms.
#              For high-throughput traditional servers swap NullPool back to
#              the default QueuePool or use a PgBouncer proxy.

engine_kwargs: dict = {}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # NullPool: no connection is held between requests (serverless-safe).
    from sqlalchemy.pool import NullPool
    engine_kwargs["poolclass"] = NullPool

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session and guarantees cleanup."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
