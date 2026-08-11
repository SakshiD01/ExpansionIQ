from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DEFAULT_SQLITE = f"sqlite:///{ROOT / 'expansioniq.db'}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = DEFAULT_SQLITE
    gemini_api_key: str = ""
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    seed_path: str = str(DATA_DIR / "seed_case.json")

    @property
    def origins(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def sqlalchemy_url(self) -> str:
        url = self.database_url.strip()
        if not url:
            return DEFAULT_SQLITE
        # Neon / Postgres often needs psycopg2 driver prefix
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg2://", 1)
        if url.startswith("postgresql://") and "+psycopg2" not in url:
            return url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
