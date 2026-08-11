"use client";

import { useEffect, useState } from "react";
import {
  EmptyError,
  LoadingGrid,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, RecommendationPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function RecommendationPage() {
  const [data, setData] = useState<RecommendationPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setBusy(true);
    setError(null);
    api
      .recommendation()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false));
  }

  useEffect(() => {
    load();
  }, []);

  if (error && !data) {
    return (
      <ModuleShell eyebrow="Synthesis · Cross-module" title="AI Recommendation Engine">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }
  if (!data) {
    return (
      <ModuleShell eyebrow="Synthesis · Cross-module" title="AI Recommendation Engine">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      eyebrow="Synthesis · Cross-module"
      title="AI Recommendation Engine"
      description="Reads market, competitive, stakeholder, requirement, gap, financial, and risk outputs — then produces a go/no-go with a visible reasoning trace."
      actions={
        <button type="button" className="btn-primary" onClick={load} disabled={busy}>
          {busy ? "Refreshing…" : "Refresh verdict"}
        </button>
      }
    >
      <section className="panel mb-6 overflow-hidden">
        <div className="bg-accent-soft/50 px-6 py-6">
          <p className="eyebrow text-accent">Verdict</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">{data.verdict}</h2>
          <p className="caption mt-3 max-w-3xl">{data.headline}</p>
        </div>
        <div className="grid gap-px bg-line sm:grid-cols-3">
          <div className="bg-bg-elev p-4">
            <p className="eyebrow">Confidence</p>
            <p className="metric mt-2 text-2xl text-accent">{data.confidence}</p>
          </div>
          <div className="bg-bg-elev p-4">
            <p className="eyebrow">Engine</p>
            <p className="mt-2 font-mono text-sm text-ink-muted">{data.source}</p>
            <p className="mt-2 text-xs text-ink-faint">
              Set GEMINI_API_KEY for live Gemini synthesis; rule engine always available.
            </p>
          </div>
          <div className="bg-bg-elev p-4">
            <p className="eyebrow">Factors weighed</p>
            <p className="metric mt-2 text-2xl">{data.reasoning.length}</p>
          </div>
        </div>
      </section>

      <div className="panel-soft p-5">
        <p className="eyebrow mb-4">Reasoning trace</p>
        <ul className="space-y-3">
          {data.reasoning.map((r, idx) => (
            <li
              key={`${r.factor}-${idx}`}
              className="flex gap-3 rounded-lg border border-line bg-bg p-4"
            >
              <span
                className={cn(
                  "mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full",
                  r.direction === "for" ? "bg-accent" : "bg-danger"
                )}
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ink">{r.factor}</p>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide",
                      r.direction === "for"
                        ? "bg-accent-soft text-accent"
                        : "bg-danger/15 text-danger"
                    )}
                  >
                    {r.direction}
                  </span>
                  {r.weight != null ? (
                    <span className="font-mono text-[10px] text-ink-faint">
                      w {r.weight} · v {r.value}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-ink-muted">{r.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ModuleShell>
  );
}
