"use client";

import { useEffect, useState } from "react";
import {
  EmptyError,
  InsightCaption,
  LoadingGrid,
  MetricCard,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, CompetitorsPayload } from "@/lib/api";

export default function CompetitorsPage() {
  const [data, setData] = useState<CompetitorsPayload | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .competitors()
      .then((res) => {
        setData(res);
        setSelected(res.competitors.find((c) => c.isSelf)?.id ?? res.competitors[0]?.id);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <ModuleShell title="Competitor Analysis">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }
  if (!data) {
    return (
      <ModuleShell title="Competitor Analysis">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  const active = data.competitors.find((c) => c.id === selected) ?? data.competitors[0];
  const avgForce =
    data.fiveForces.reduce((s, f) => s + f.score, 0) / data.fiveForces.length;

  return (
    <ModuleShell
      eyebrow="Framework · Porter's Five Forces"
      title="Competitor Analysis"
      description="Industry structure for German retail inventory intelligence, plus a configurable positioning map."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Avg force intensity" value={avgForce.toFixed(1)} hint="1–5 scale" tone="warn" />
        <MetricCard label="Tracked competitors" value={`${data.competitors.length}`} />
        <MetricCard
          label="Axes"
          value={`${data.positioningAxes.x} × ${data.positioningAxes.y}`}
          hint="2×2 positioning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel-soft p-5">
          <p className="eyebrow mb-4">Five Forces</p>
          <ul className="space-y-4">
            {data.fiveForces.map((f) => (
              <li key={f.force}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-ink">{f.force}</span>
                  <span className="font-mono text-accent">{f.score}/5</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(f.score / 5) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-faint">{f.justification}</p>
              </li>
            ))}
          </ul>
          <InsightCaption>
            Buyer power and rivalry dominate — expect structured RFPs and incumbent discounting on strategic logos.
          </InsightCaption>
        </div>

        <div className="panel-soft p-5">
          <p className="eyebrow mb-2">Positioning map</p>
          <p className="mb-4 text-xs text-ink-faint">
            X: {data.positioningAxes.x} · Y: {data.positioningAxes.y}
          </p>
          <div className="relative h-80 rounded-lg border border-line bg-bg">
            <div className="absolute inset-0 bg-grid-faint bg-grid opacity-40" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-line" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-line" />
            {data.competitors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border px-2 py-1 text-[10px] font-medium transition hover:scale-105"
                style={{
                  left: `${c.x}%`,
                  bottom: `${c.y}%`,
                  borderColor: c.isSelf ? "#2dd4a8" : "#232833",
                  background: c.isSelf ? "rgba(45,212,168,0.2)" : "#15181e",
                  color: c.isSelf ? "#2dd4a8" : "#f2f3f5",
                }}
              >
                {c.name.split(" ")[0]}
              </button>
            ))}
          </div>
          <InsightCaption>
            Harborstack sits mid-price with shallow local depth today — the strategic move is climbing the Y-axis via references, not racing on price.
          </InsightCaption>
        </div>
      </div>

      {active ? (
        <div className="panel-soft mt-6 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Mini-SWOT</p>
              <h3 className="font-display text-xl font-semibold">{active.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.competitors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={`rounded-md border px-2 py-1 text-xs ${
                    c.id === active.id
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-ink-muted"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["Strengths", active.swot.strengths],
                ["Weaknesses", active.swot.weaknesses],
                ["Opportunities", active.swot.opportunities],
                ["Threats", active.swot.threats],
              ] as const
            ).map(([label, items]) => (
              <div key={label} className="rounded-lg border border-line bg-bg p-3">
                <p className="eyebrow mb-2">{label}</p>
                <ul className="space-y-1.5 text-xs text-ink-muted">
                  {items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </ModuleShell>
  );
}
