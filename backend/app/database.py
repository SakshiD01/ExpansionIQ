from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

from sqlalchemy import DateTime, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


class CaseSnapshot(Base):
    """Stores the full case-study JSON blob (seed + any user adjustments)."""

    __tablename__ = "case_snapshots"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    label: Mapped[str] = mapped_column(String(128), default="default")
    payload: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


settings = get_settings()
engine = create_engine(
    settings.sqlalchemy_url,
    connect_args={"check_same_thread": False}
    if settings.sqlalchemy_url.startswith("sqlite")
    else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    seed_if_empty()


def seed_if_empty() -> None:
    seed_path = Path(settings.seed_path)
    if not seed_path.exists():
        raise FileNotFoundError(f"Seed file missing: {seed_path}")

    with SessionLocal() as db:
        existing = db.get(CaseSnapshot, "harborstack-de-2026")
        if existing:
            return
        payload = seed_path.read_text(encoding="utf-8")
        # validate JSON
        json.loads(payload)
        db.add(
            CaseSnapshot(
                id="harborstack-de-2026",
                label="Harborstack → Germany",
                payload=payload,
            )
        )
        db.commit()


def get_case_dict() -> dict[str, Any]:
    with SessionLocal() as db:
        row = db.get(CaseSnapshot, "harborstack-de-2026")
        if not row:
            seed_if_empty()
            row = db.get(CaseSnapshot, "harborstack-de-2026")
        assert row is not None
        return json.loads(row.payload)


def save_case_dict(data: dict[str, Any]) -> dict[str, Any]:
    with SessionLocal() as db:
        row = db.get(CaseSnapshot, "harborstack-de-2026")
        if not row:
            row = CaseSnapshot(id="harborstack-de-2026", label="Harborstack → Germany")
            db.add(row)
        row.payload = json.dumps(data)
        row.updated_at = datetime.utcnow()
        db.commit()
        return data
