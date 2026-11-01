from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartBus AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # --- Security ---
    # Override SECRET_KEY via the SECRET_KEY environment variable in production.
    # Never commit a real secret here; this default is only for local development.
    SECRET_KEY: str = "smartbus-ai-dev-only-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # --- Database ---
    # For local dev: sqlite:///./smartbus.db
    # For Vercel + Neon/Supabase: postgresql+psycopg2://...
    DATABASE_URL: str = "sqlite:///./smartbus.db"

    # --- CORS ---
    # In production set this env-var to a JSON array of allowed origins, e.g.:
    #   BACKEND_CORS_ORIGINS='["https://smartbus.vercel.app"]'
    # Wildcard "*" is only kept as the last-resort local-dev default.
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # --- Runtime environment ---
    ENVIRONMENT: str = "development"

    # --- AWS Cloud (optional; used only if deploying to AWS) ---
    AWS_REGION: Optional[str] = None
    AWS_S3_BUCKET_NAME: Optional[str] = None

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
