from __future__ import annotations

import os
from typing import Any

from app.services.scoring import synthesize_signals


def _rule_based_recommendation(signals: dict[str, Any]) -> dict[str, Any]:
    """Deterministic fallback when Gemini is unavailable."""
    market = signals["marketReadiness"]
    residual_risk = signals.get("residualRiskAggregate", signals["riskAggregate"])
    npv = signals["financial"]["npv"]
    gaps = signals["gapSeverity"]
    threat = signals["competitiveThreat"]

    score = 0.0
    reasons: list[dict[str, Any]] = []

    def weigh(label: str, value: float, direction: str, weight: float, detail: str):
        nonlocal score
        contribution = value * weight if direction == "positive" else (100 - value) * weight
        # normalize value already 0-100 except npv handled separately
        score += contribution
        reasons.append(
            {
                "factor": label,
                "direction": "for" if direction == "positive" else "against",
                "weight": weight,
                "value": value,
                "detail": detail,
            }
        )

    weigh(
        "Market readiness",
        market,
        "positive",
        0.25,
        f"Composite CAGE+PESTEL score is {market}/100.",
    )
    weigh(
        "Residual risk",
        residual_risk,
        "negative",
        0.2,
        f"Residual risk heat is {residual_risk}/100 after planned mitigations.",
    )
    weigh(
        "Capability gaps",
        gaps,
        "negative",
        0.15,
        f"Average gap severity indexes at {gaps}/100.",
    )
    weigh(
        "Competitive intensity",
        threat,
        "negative",
        0.15,
        f"Buyer power + rivalry imply threat index {threat}/100.",
    )

    # NPV special: map to 0-100 via sign/magnitude
    npv_score = 70 if npv > 500_000 else 55 if npv > 0 else 30
    weigh(
        "Financial viability (base NPV)",
        npv_score,
        "positive",
        0.25,
        f"Base-case NPV ≈ €{npv:,.0f}; break-even month {signals['financial']['breakEvenMonth']}.",
    )

    # score currently sum of weighted 0-100 components
    confidence = round(min(100, max(0, score)), 1)

    if confidence >= 58 and npv > 0 and market >= 70:
        verdict = "GO — Conditional"
        headline = (
            "Proceed with a Germany-first entry under staged capital gates: "
            "secure SAP connector critical path and Country Manager before scaling GTM burn."
        )
    elif confidence >= 48:
        verdict = "HOLD — Validate"
        headline = (
            "Do not fully commit yet. Run a 2-logo design-partner program and re-score "
            "after connector and hiring milestones clear."
        )
    else:
        verdict = "NO-GO — Reassess"
        headline = (
            "Base economics and risk posture do not support entry this cycle. "
            "Revisit after product localisation and partner coverage improve."
        )

    return {
        "verdict": verdict,
        "confidence": confidence,
        "headline": headline,
        "reasoning": reasons,
        "source": "rule-engine",
    }


def generate_recommendation(case: dict[str, Any]) -> dict[str, Any]:
    signals = synthesize_signals(case)
    api_key = os.getenv("GEMINI_API_KEY", "")
    fallback = _rule_based_recommendation(signals)

    if not api_key:
        return {**fallback, "signals": signals}

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"""
You are a senior strategy consultant advising on market expansion.
Given these ExpansionIQ signals for Harborstack (Irish SaaS) entering Germany:
{signals}

Return a concise JSON object with keys:
verdict (string: GO — Conditional | HOLD — Validate | NO-GO — Reassess),
confidence (0-100 number),
headline (1-2 sentences),
reasoning (array of {{factor, direction: for|against, detail}}).
Be plain-English and business-first. Do not invent numbers not in the signals.
"""
        resp = model.generate_content(prompt)
        text = resp.text or ""
        # Try to extract JSON
        import json
        import re

        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            parsed = json.loads(match.group(0))
            return {
                "verdict": parsed.get("verdict", fallback["verdict"]),
                "confidence": parsed.get("confidence", fallback["confidence"]),
                "headline": parsed.get("headline", fallback["headline"]),
                "reasoning": parsed.get("reasoning", fallback["reasoning"]),
                "source": "gemini",
                "signals": signals,
            }
    except Exception as exc:  # noqa: BLE001
        fallback["source"] = f"rule-engine (gemini error: {exc})"

    return {**fallback, "signals": signals}
