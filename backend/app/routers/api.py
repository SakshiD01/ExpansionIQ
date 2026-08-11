from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.database import get_case_dict, save_case_dict
from app.services.ai import generate_recommendation
from app.services.scoring import (
    monte_carlo_npv,
    project_financials,
    risk_score,
    synthesize_signals,
    weighted_market_score,
)

router = APIRouter(prefix="/api")


class WeightUpdate(BaseModel):
    weights: dict[str, float] = Field(..., description="dimensionId -> weight")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "expansioniq-api"}


@router.get("/case")
def get_case() -> dict[str, Any]:
    return get_case_dict()


@router.get("/case/meta")
def case_meta() -> dict[str, Any]:
    case = get_case_dict()
    return case["caseStudy"]


@router.get("/dashboard")
def dashboard() -> dict[str, Any]:
    case = get_case_dict()
    signals = synthesize_signals(case)
    rec = generate_recommendation(case)
    return {
        "caseStudy": case["caseStudy"],
        "signals": signals,
        "recommendation": {
            "verdict": rec["verdict"],
            "confidence": rec["confidence"],
            "headline": rec["headline"],
            "source": rec["source"],
        },
    }


@router.get("/market-scoring")
def market_scoring() -> dict[str, Any]:
    case = get_case_dict()
    ms = case["marketScoring"]
    result = weighted_market_score(ms["dimensions"])
    return {
        **result,
        "narrative": ms["narrative"],
        "defaultWeights": ms["defaultWeights"],
    }


@router.post("/market-scoring/recalculate")
def recalculate_market(body: WeightUpdate) -> dict[str, Any]:
    case = get_case_dict()
    known = {d["id"] for d in case["marketScoring"]["dimensions"]}
    filtered = {k: float(v) for k, v in body.weights.items() if k in known}
    if not filtered:
        raise HTTPException(
            status_code=400,
            detail=f"No recognized dimension ids. Expected one of: {sorted(known)}",
        )
    total = sum(filtered.values()) or 1.0
    norm = {k: v / total for k, v in filtered.items()}
    # Keep unspecified dimensions at their current weight, then re-normalize all
    merged = {d["id"]: float(d.get("weight", 0)) for d in case["marketScoring"]["dimensions"]}
    merged.update(norm)
    merged_total = sum(merged.values()) or 1.0
    merged = {k: v / merged_total for k, v in merged.items()}
    result = weighted_market_score(case["marketScoring"]["dimensions"], merged)
    for d in case["marketScoring"]["dimensions"]:
        d["weight"] = merged[d["id"]]
    case["marketScoring"]["defaultWeights"] = merged
    save_case_dict(case)
    return {**result, "narrative": case["marketScoring"]["narrative"]}


@router.get("/competitors")
def competitors() -> dict[str, Any]:
    return get_case_dict()["competitors"]


@router.get("/stakeholders")
def stakeholders() -> dict[str, Any]:
    return get_case_dict()["stakeholders"]


@router.get("/requirements")
def requirements() -> dict[str, Any]:
    return get_case_dict()["requirements"]


@router.get("/gaps")
def gaps() -> dict[str, Any]:
    return get_case_dict()["gaps"]


@router.get("/processes")
def processes() -> dict[str, Any]:
    return get_case_dict()["processes"]


@router.get("/financials")
def financials(fxMult: float = 1.0) -> dict[str, Any]:
    case = get_case_dict()
    fin = case["financials"]
    scenarios = {
        name: project_financials(fin["assumptions"], sc, fx_mult=fxMult)
        for name, sc in fin["scenarios"].items()
    }
    return {"assumptions": fin["assumptions"], "scenarios": scenarios, "fxMult": fxMult}


@router.get("/financials/monte-carlo")
def financials_monte_carlo(runs: int = 500) -> dict[str, Any]:
    case = get_case_dict()
    fin = case["financials"]
    return monte_carlo_npv(fin["assumptions"], fin["scenarios"]["base"], runs=runs)


@router.get("/risks")
def risks() -> dict[str, Any]:
    case = get_case_dict()
    items = case["risks"]["items"]
    return {
        "items": items,
        "inherent": risk_score(items, residual=False),
        "residual": risk_score(items, residual=True),
    }


@router.get("/recommendation")
def recommendation() -> dict[str, Any]:
    case = get_case_dict()
    return generate_recommendation(case)


@router.post("/recommendation/refresh")
def refresh_recommendation() -> dict[str, Any]:
    case = get_case_dict()
    return generate_recommendation(case)
