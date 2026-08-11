"use client";

import { useEffect, useMemo, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import {
  EmptyError,
  InsightCaption,
  LoadingGrid,
  MetricCard,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, MarketScoringPayload } from "@/lib/api";

export default function MarketPage() {
  const [data, setData] = useState<MarketScoringPayload | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .marketScoring()
      .then((res) => {
        setData(res);
        const w: Record<string, number> = {};
        res.dimensions.forEach((d) => {
          w[d.id] = d.effectiveWeight ?? d.weight ?? 0.1;
        });
        setWeights(res.defaultWeights || w);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const chartData = useMemo(
    () =>
      data?.dimensions.map((d) => ({
        dimension: d.name,
        score: d.score,
        fullMark: 100,
      })) ?? [],
    [data]
  );

  async function onWeightChange(id: string, value: number) {
    const next = { ...weights, [id]: value };
    setWeights(next);
    setBusy(true);
    try {
      const res = await api.recalculateMarket(next);
      setData(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !data) {
    return (
      <ModuleShell title="Market Scoring Engine" description="CAGE + PESTEL">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }

  if (!data) {
    return (
      <ModuleShell title="Market Scoring Engine">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell
      eyebrow="Framework · CAGE + PESTEL"
      title="Market Scoring Engine"
      description="Weighted multi-criteria readiness for Germany. Adjust weights to stress-test what drives the composite."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Composite readiness"
          value={`${data.composite}`}
          hint="Live weighted score / 100"
          tone="accent"
        />
        <MetricCard
          label="Dimensions"
          value={`${data.dimensions.length}`}
          hint="CAGE (4) + PESTEL (6)"
        />
        <MetricCard
          label="Weight sum"
          value={(data.weightSum ?? 1).toFixed(2)}
          hint={busy ? "Recalculating…" : "Normalised on change"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel-soft p-4">
          <p className="eyebrow mb-2">Dimension radar</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#232833" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "#9aa3b2", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#6b7382", fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#2dd4a8"
                  fill="#2dd4a8"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <InsightCaption>
            Geographic and administrative distance score highest; legal and economic softness pull the composite down from an automatic go.
          </InsightCaption>
        </div>

        <div className="panel-soft p-5">
          <p className="eyebrow mb-4">Criterion weights</p>
          <div className="max-h-[22rem] space-y-4 overflow-y-auto pr-1">
            {data.dimensions.map((d) => (
              <div key={d.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {d.name}{" "}
                    <span className="text-ink-faint">· {d.framework}</span>
                  </span>
                  <span className="font-mono text-xs text-accent">
                    {d.score} · w {(weights[d.id] ?? 0).toFixed(2)}
                  </span>
                </div>
                <input
                  className="slider"
                  type="range"
                  min={0.02}
                  max={0.25}
                  step={0.01}
                  value={weights[d.id] ?? 0.1}
                  onChange={(e) => onWeightChange(d.id, parseFloat(e.target.value))}
                />
                <p className="mt-1 text-xs text-ink-faint line-clamp-2">{d.justification}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel-soft mt-6 p-5">
        <p className="eyebrow">AI narrative</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{data.narrative}</p>
      </div>
    </ModuleShell>
  );
}
