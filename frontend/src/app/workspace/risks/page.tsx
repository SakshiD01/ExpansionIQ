"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EmptyError,
  InsightCaption,
  LoadingGrid,
  MetricCard,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, RisksPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

function heatColor(score: number): string {
  if (score >= 20) return "bg-danger/80 text-ink";
  if (score >= 12) return "bg-warn/70 text-accent-ink";
  if (score >= 6) return "bg-warn/30 text-ink";
  return "bg-accent/20 text-accent";
}

export default function RisksPage() {
  const [data, setData] = useState<RisksPayload | null>(null);
  const [mode, setMode] = useState<"inherent" | "residual">("inherent");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.risks().then(setData).catch((e: Error) => setError(e.message));
  }, []);

  const matrix = useMemo(() => {
    if (!data) return [];
    const cells: { p: number; i: number; risks: typeof data.items }[] = [];
    for (let p = 5; p >= 1; p--) {
      for (let i = 1; i <= 5; i++) {
        const risks = data.items.filter((r) => {
          const rp = mode === "inherent" ? r.probability : r.residualProbability;
          const ri = mode === "inherent" ? r.impact : r.residualImpact;
          return rp === p && ri === i;
        });
        cells.push({ p, i, risks });
      }
    }
    return cells;
  }, [data, mode]);

  if (error && !data) {
    return (
      <ModuleShell eyebrow="Framework · PMBOK probability–impact" title="Risk Analysis">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }
  if (!data) {
    return (
      <ModuleShell eyebrow="Framework · PMBOK probability–impact" title="Risk Analysis">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  const agg = mode === "inherent" ? data.inherent : data.residual;

  return (
    <ModuleShell
      eyebrow="Framework · PMBOK probability–impact"
      title="Risk Analysis"
      description="Expansion-specific risk register with a proper heat map — not a flat list."
      actions={
        <div className="flex gap-2">
          {(["inherent", "residual"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs capitalize",
                mode === m
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line text-ink-muted"
              )}
            >
              {m}
            </button>
          ))}
        </div>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Aggregate risk" value={`${agg.aggregate}`} tone="warn" />
        <MetricCard label="Risk count" value={`${agg.count}`} />
        <MetricCard label="High cells (≥15)" value={`${agg.highCount}`} tone="danger" />
      </div>

      <div className="panel-soft p-5">
        <p className="eyebrow mb-3">Probability × Impact heat map</p>
        <div className="mb-2 flex items-end gap-3">
          <span className="w-16 text-[10px] text-ink-faint">Prob ↑</span>
          <div className="grid flex-1 grid-cols-5 gap-1 text-center text-[10px] text-ink-faint">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i}>Impact {i}</span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[4rem_1fr] gap-2">
          <div className="grid grid-rows-5 gap-1 text-right text-[10px] text-ink-faint">
            {[5, 4, 3, 2, 1].map((p) => (
              <div key={p} className="flex h-16 items-center justify-end pr-1">
                {p}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 grid-rows-5 gap-1">
            {matrix.map((cell) => (
              <div
                key={`${cell.p}-${cell.i}`}
                className={cn(
                  "flex h-16 flex-col items-center justify-center rounded-md p-1 text-[10px]",
                  heatColor(cell.p * cell.i)
                )}
                title={`P${cell.p}×I${cell.i}`}
              >
                {cell.risks.length ? (
                  cell.risks.map((r) => (
                    <span key={r.id} className="line-clamp-1">
                      {r.title.split(" ").slice(0, 2).join(" ")}
                    </span>
                  ))
                ) : (
                  <span className="opacity-40">{cell.p * cell.i}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        <InsightCaption>
          Sales-cycle and brand-trust risks cluster high inherent; mitigation pulls several cells down but SAP delay residual impact stays elevated.
        </InsightCaption>
      </div>

      <div className="mt-6 space-y-3">
        {data.items.map((r) => {
          const score =
            mode === "inherent"
              ? r.probability * r.impact
              : r.residualProbability * r.residualImpact;
          return (
            <div key={r.id} className="panel-soft p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="eyebrow">{r.category}</p>
                  <h3 className="text-sm font-medium text-ink">{r.title}</h3>
                </div>
                <span className="font-mono text-xs text-warn">Score {score}</span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">
                <span className="text-accent">Mitigation: </span>
                {r.mitigation}
              </p>
              <p className="mt-1 font-mono text-[11px] text-ink-faint">
                Inherent {r.probability}×{r.impact} → Residual {r.residualProbability}×
                {r.residualImpact}
              </p>
            </div>
          );
        })}
      </div>
    </ModuleShell>
  );
}
