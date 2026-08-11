"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
import { api, GapsPayload } from "@/lib/api";
import { formatEur } from "@/lib/utils";

export default function GapsPage() {
  const [data, setData] = useState<GapsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.gaps().then(setData).catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <ModuleShell title="Gap Analysis">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }
  if (!data) {
    return (
      <ModuleShell title="Gap Analysis">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  const totalCost = data.items.reduce((s, g) => s + g.estimatedCostEur, 0);
  const avgSev =
    data.items.reduce((s, g) => s + g.severity, 0) / data.items.length;

  return (
    <ModuleShell
      eyebrow="Framework · McKinsey 7S"
      title="Gap Analysis"
      description="Current-state vs future-state capability gaps for Germany entry, with closing actions that feed financials and risk."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Capability gaps" value={`${data.items.length}`} />
        <MetricCard
          label="Avg severity"
          value={avgSev.toFixed(1)}
          hint="1–5 scale"
          tone="warn"
        />
        <MetricCard
          label="Close-out cost"
          value={formatEur(totalCost, true)}
          hint="Sum of estimated closing actions"
        />
      </div>

      <div className="panel-soft mb-6 p-4">
        <p className="eyebrow mb-2">McKinsey 7S readiness</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.sevenS}>
              <CartesianGrid stroke="#232833" vertical={false} />
              <XAxis dataKey="element" tick={{ fill: "#9aa3b2", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "#6b7382", fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "#101216",
                  border: "1px solid #232833",
                  borderRadius: 8,
                }}
              />
              <Legend />
              <Bar dataKey="currentScore" name="Current" fill="#6b7382" radius={[4, 4, 0, 0]} />
              <Bar dataKey="targetScore" name="Target" fill="#2dd4a8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <InsightCaption>
          Staff and Structure are the widest 7S gaps — entity setup and DE hiring are the organisational critical path.
        </InsightCaption>
      </div>

      <div className="space-y-3">
        {data.items.map((g) => (
          <div key={g.id} className="panel-soft p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">{g.mckinsey7s}</p>
                <h3 className="font-display text-lg font-semibold text-ink">{g.area}</h3>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-warn">Severity {g.severity}/5</p>
                <p className="text-xs text-ink-faint">
                  {formatEur(g.estimatedCostEur)} · {g.estimatedMonths} mo
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-line bg-bg p-3">
                <p className="text-[10px] uppercase text-ink-faint">Current</p>
                <p className="mt-1 text-sm text-ink-muted">{g.currentState}</p>
              </div>
              <div className="rounded-lg border border-line bg-bg p-3">
                <p className="text-[10px] uppercase text-ink-faint">Future</p>
                <p className="mt-1 text-sm text-ink-muted">{g.futureState}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink">
              <span className="text-accent">Close: </span>
              {g.closingAction}
            </p>
          </div>
        ))}
      </div>
    </ModuleShell>
  );
}
