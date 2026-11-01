"""
Vercel serverless entry-point for SmartBus AI FastAPI backend.

Vercel's Python runtime looks for an ASGI/WSGI callable at `api/index.py`
(relative to the project root configured in vercel.json).  We simply import
the FastAPI `app` object already built in `app/main.py` and re-export it as
`app` so Vercel's adapter can discover it.

Important notes for Vercel deployment
--------------------------------------
* Set the following environment variables in the Vercel project dashboard
  (Project → Settings → Environment Variables):

    SECRET_KEY            – strong random string (32+ chars)
    DATABASE_URL          – postgresql+psycopg2://<user>:<pass>@<host>/<db>
                            (use Neon, Supabase, or any external Postgres)
    ENVIRONMENT           – production
    BACKEND_CORS_ORIGINS  – '["https://your-frontend.vercel.app"]'

* SQLite is NOT suitable for Vercel serverless because:
    - The /tmp filesystem is ephemeral and wiped between cold starts.
    - Concurrent write locks are not supported across serverless instances.
  Always use an external PostgreSQL database in production.

* The ML model artifact (rf_occupancy_model.joblib, ~57 MB) is bundled with
  the deployment.  Keep `maxLambdaSize` at 50 MB in vercel.json or host the
  artifact on S3/R2 and load it lazily to stay under the limit.
"""

import sys
import os

# Make `app/` importable regardless of Vercel's working directory.
_backend_dir = os.path.dirname(os.path.dirname(__file__))  # .../backend/
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Re-export the FastAPI application.
from app.main import app  # noqa: E402  (import not at top of file is intentional)

__all__ = ["app"]

