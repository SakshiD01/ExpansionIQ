"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  EmptyError,
  InsightCaption,
  LoadingGrid,
  MetricCard,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, FinancialsPayload, MonteCarloPayload } from "@/lib/api";
import { formatEur, formatMonths } from "@/lib/utils";

export default function FinancialsPage() {
  const [data, setData] = useState<FinancialsPayload | null>(null);
  const [mc, setMc] = useState<MonteCarloPayload | null>(null);
  const [fx, setFx] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .financials(fx)
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [fx]);

  useEffect(() => {
    api.monteCarlo(500).then(setMc).catch(() => setMc(null));
  }, []);

  if (error && !data) {
    return (
      <ModuleShell title="Financial Forecasting">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }
  if (!data) {
    return (
      <ModuleShell title="Financial Forecasting">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  const base = data.scenarios.base;
  const chartData = [0, 1, 2, 3, 4].map((i) => ({
    year: `Y${i + 1}`,
    best: data.scenarios.best.revenueByYear[i],
    base: data.scenarios.base.revenueByYear[i],
    worst: data.scenarios.worst.revenueByYear[i],
  }));

  return (
    <ModuleShell
      eyebrow="Model · Bottoms-up + NPV/IRR"
      title="Financial Forecasting"
      description="Three scenarios always — best, base, worst. Never a single-line forecast pretending false precision."
      actions={
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          FX sensitivity
          <input
            type="range"
            min={0.85}
            max={1.15}
            step={0.01}
            value={fx}
            onChange={(e) => setFx(parseFloat(e.target.value))}
            className="slider w-28"
          />
          <span className="font-mono text-accent">{fx.toFixed(2)}×</span>
        </label>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Base NPV"
          value={formatEur(base.npv, true)}
          tone={base.npv > 0 ? "accent" : "danger"}
        />
        <MetricCard
          label="Base IRR"
          value={base.irr != null ? `${(base.irr * 100).toFixed(0)}%` : "—"}
        />
        <MetricCard
          label="Break-even"
          value={formatMonths(base.breakEvenMonth)}
          hint="Base case"
        />
        <MetricCard
          label="Setup cost"
          value={formatEur(base.setupCost, true)}
          hint={`Cost mult applied · FX ${fx.toFixed(2)}`}
        />
      </div>

      <div className="panel-soft mb-6 p-4">
        <p className="eyebrow mb-2">Revenue by year — three scenarios</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#232833" />
              <XAxis dataKey="year" tick={{ fill: "#9aa3b2", fontSize: 12 }} />
              <YAxis
                tick={{ fill: "#6b7382", fontSize: 11 }}
                tickFormatter={(v) => `${Math.round(v / 1e6)}M`}
              />
              <Tooltip
                formatter={(v) => formatEur(Number(v))}
                contentStyle={{
                  background: "#101216",
                  border: "1px solid #232833",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="best" stroke="#2dd4a8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="base" stroke="#e8b84a" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="worst" stroke="#f07178" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <InsightCaption>
          Base NPV stays positive but modest; worst case destroys value — capital should stage on hiring and SAP milestones.
        </InsightCaption>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {(["best", "base", "worst"] as const).map((key) => {
          const s = data.scenarios[key];
          return (
            <div key={key} className="panel-soft p-5">
              <p className="eyebrow capitalize">{key} case</p>
              <p className="metric mt-2 text-xl">{formatEur(s.npv, true)}</p>
              <dl className="mt-4 space-y-2 text-xs text-ink-muted">
                <div className="flex justify-between">
                  <dt>IRR</dt>
                  <dd className="font-mono">{s.irr != null ? `${(s.irr * 100).toFixed(0)}%` : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Break-even</dt>
                  <dd className="font-mono">{formatMonths(s.breakEvenMonth)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Y5 revenue</dt>
                  <dd className="font-mono">{formatEur(s.revenueByYear[4], true)}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      {mc ? (
        <div className="panel-soft mt-6 p-5">
          <p className="eyebrow">Monte Carlo NPV distribution</p>
          <p className="caption mt-1">
            {mc.runs} runs varying penetration (0.65–1.35×) and cost (0.85–1.25×) on the base path.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-5">
            {[
              ["P10", mc.p10],
              ["P50", mc.p50],
              ["Mean", mc.mean],
              ["P90", mc.p90],
              ["Range", null],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-line bg-bg p-3">
                <p className="text-[10px] uppercase text-ink-faint">{label}</p>
                <p className="mt-1 font-mono text-sm text-ink">
                  {value == null
                    ? `${formatEur(mc.min, true)}–${formatEur(mc.max, true)}`
                    : formatEur(Number(value), true)}
                </p>
              </div>
            ))}
          </div>
          <InsightCaption>
            Distribution shows base NPV is sensitive — stage capital so worst-decile outcomes cannot strand the company.
          </InsightCaption>
        </div>
      ) : null}
    </ModuleShell>
  );
}
