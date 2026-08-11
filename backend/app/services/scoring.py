from __future__ import annotations

from typing import Any


def weighted_market_score(
    dimensions: list[dict[str, Any]], weights: dict[str, float] | None = None
) -> dict[str, Any]:
    """Compute composite 0–100 market readiness score from weighted dimensions."""
    if not dimensions:
        return {"composite": 0.0, "dimensions": [], "weightSum": 0.0}

    scored = []
    total_w = 0.0
    total = 0.0
    for d in dimensions:
        dim_id = d["id"]
        w = float(weights.get(dim_id, d.get("weight", 0)) if weights else d.get("weight", 0))
        s = float(d.get("score", 0))
        scored.append({**d, "effectiveWeight": w, "contribution": s * w})
        total_w += w
        total += s * w

    composite = (total / total_w) if total_w > 0 else 0.0
    return {
        "composite": round(composite, 1),
        "dimensions": scored,
        "weightSum": round(total_w, 4),
    }


def npv(cashflows: list[float], rate: float) -> float:
    return sum(cf / ((1 + rate) ** (i + 1)) for i, cf in enumerate(cashflows))


def irr(cashflows: list[float], guess: float = 0.1) -> float | None:
    """Newton-Raphson IRR; cashflows[0] should be initial outlay (negative)."""
    rate = guess
    for _ in range(100):
        npv_v = sum(cf / ((1 + rate) ** t) for t, cf in enumerate(cashflows))
        d_npv = sum(-t * cf / ((1 + rate) ** (t + 1)) for t, cf in enumerate(cashflows))
        if abs(d_npv) < 1e-12:
            break
        new_rate = rate - npv_v / d_npv
        if abs(new_rate - rate) < 1e-7:
            return round(new_rate, 4)
        rate = new_rate
    return None


def project_financials(
    assumptions: dict[str, Any],
    scenario: dict[str, Any],
    fx_mult: float = 1.0,
) -> dict[str, Any]:
    """Project scenario cashflows.

    Seed scenarios store absolute revenue/opex paths plus curated NPV/IRR/
    break-even headlines used for the demo narrative. Live math still produces
    cashflow series for charts; headline NPV/IRR prefer seed values (FX-scaled)
    so the executive story stays coherent.
    """
    revenue = [float(v) * fx_mult for v in scenario["revenueByYear"]]
    opex = [float(v) * fx_mult for v in scenario["opexByYear"]]
    setup = float(assumptions["setupCostEur"]) * float(scenario.get("costMult", 1)) * fx_mult

    annual_cf = [revenue[i] - opex[i] for i in range(len(revenue))]
    cashflows = [-setup] + annual_cf
    rate = float(assumptions.get("discountRate", 0.12))
    computed_npv = npv(annual_cf, rate) - setup
    computed_irr = irr(cashflows)

    cum = -setup
    break_even_month = None
    for year_idx, cf in enumerate(annual_cf):
        prev = cum
        cum += cf
        if prev < 0 <= cum:
            frac = (-prev) / cf if cf else 1
            break_even_month = int(year_idx * 12 + frac * 12)
            break

    seed_npv = scenario.get("npv")
    seed_irr = scenario.get("irr")
    seed_be = scenario.get("breakEvenMonth")

    return {
        "setupCost": round(setup),
        "revenueByYear": [round(v) for v in revenue],
        "opexByYear": [round(v) for v in opex],
        "cashflowByYear": [round(v) for v in annual_cf],
        "npv": round(float(seed_npv) * fx_mult) if seed_npv is not None else round(computed_npv),
        "irr": float(seed_irr) if seed_irr is not None else computed_irr,
        "breakEvenMonth": seed_be if seed_be is not None else break_even_month,
        "computedNpv": round(computed_npv),
    }


def risk_score(items: list[dict[str, Any]], residual: bool = False) -> dict[str, Any]:
    if not items:
        return {"aggregate": 0, "count": 0, "highCount": 0}
    scores = []
    for r in items:
        if residual:
            p, i = r.get("residualProbability", r["probability"]), r.get(
                "residualImpact", r["impact"]
            )
        else:
            p, i = r["probability"], r["impact"]
        scores.append(p * i)
    agg = sum(scores) / (len(scores) * 25) * 100  # normalize to 0-100
    high = sum(1 for s in scores if s >= 15)
    return {
        "aggregate": round(agg, 1),
        "count": len(items),
        "highCount": high,
        "maxCell": max(scores) if scores else 0,
    }


def monte_carlo_npv(
    assumptions: dict[str, Any],
    base_scenario: dict[str, Any],
    runs: int = 500,
    seed: int = 42,
) -> dict[str, Any]:
    """Lightweight Monte Carlo on penetration and cost multipliers."""
    import numpy as np

    rng = np.random.default_rng(seed)
    npvs: list[float] = []
    rate = float(assumptions.get("discountRate", 0.12))
    setup0 = float(assumptions["setupCostEur"]) * float(base_scenario.get("costMult", 1))
    rev0 = [float(v) for v in base_scenario["revenueByYear"]]
    opex0 = [float(v) for v in base_scenario["opexByYear"]]

    for _ in range(max(50, min(runs, 5000))):
        pen = float(rng.uniform(0.65, 1.35))
        cost = float(rng.uniform(0.85, 1.25))
        revenue = [v * pen for v in rev0]
        opex = [v * cost for v in opex0]
        setup = setup0 * cost
        annual_cf = [revenue[i] - opex[i] for i in range(len(revenue))]
        npvs.append(npv(annual_cf, rate) - setup)

    arr = np.array(npvs)
    return {
        "runs": len(npvs),
        "mean": round(float(arr.mean())),
        "p10": round(float(np.percentile(arr, 10))),
        "p50": round(float(np.percentile(arr, 50))),
        "p90": round(float(np.percentile(arr, 90))),
        "min": round(float(arr.min())),
        "max": round(float(arr.max())),
    }


def synthesize_signals(case: dict[str, Any]) -> dict[str, Any]:
    """Aggregate cross-module signals for dashboard + AI engine."""
    market = weighted_market_score(case["marketScoring"]["dimensions"])
    forces = case["competitors"]["fiveForces"]
    rivalry = next((f["score"] for f in forces if "rivalry" in f["force"].lower()), 3)
    buyer = next((f["score"] for f in forces if "buyer" in f["force"].lower()), 3)
    competitive_threat = round(((rivalry + buyer) / 2) / 5 * 100, 1)

    stakeholders = case["stakeholders"]["register"]
    aligned = sum(1 for s in stakeholders if s["interest"] >= 7 and s["influence"] >= 6)
    alignment_pct = round(aligned / len(stakeholders) * 100, 1) if stakeholders else 0

    reqs = case["requirements"]["items"]
    musts = [r for r in reqs if r["priority"] == "Must"]
    must_done = sum(1 for r in musts if r["status"] in ("Done", "In Progress"))
    req_completion = round(must_done / len(musts) * 100, 1) if musts else 0

    gaps = case["gaps"]["items"]
    gap_severity = round(sum(g["severity"] for g in gaps) / len(gaps) * 20, 1) if gaps else 0

    fin = case["financials"]
    base = project_financials(fin["assumptions"], fin["scenarios"]["base"])
    risk = risk_score(case["risks"]["items"], residual=False)
    residual = risk_score(case["risks"]["items"], residual=True)

    top_threats = sorted(
        [c for c in case["competitors"]["competitors"] if not c.get("isSelf")],
        key=lambda c: c["y"],
        reverse=True,
    )[:3]

    return {
        "marketReadiness": market["composite"],
        "competitiveThreat": competitive_threat,
        "stakeholderAlignment": alignment_pct,
        "requirementCompletion": req_completion,
        "gapSeverity": gap_severity,
        "financial": {
            "npv": base["npv"],
            "irr": base["irr"],
            "breakEvenMonth": base["breakEvenMonth"],
            "year5Revenue": base["revenueByYear"][-1] if base["revenueByYear"] else 0,
            "scenarios": {
                k: project_financials(fin["assumptions"], v)
                for k, v in fin["scenarios"].items()
            },
        },
        "riskAggregate": risk["aggregate"],
        "residualRiskAggregate": residual["aggregate"],
        "topCompetitiveThreats": [
            {"id": c["id"], "name": c["name"], "localDepth": c["y"]} for c in top_threats
        ],
        "marketDimensions": market["dimensions"],
    }
