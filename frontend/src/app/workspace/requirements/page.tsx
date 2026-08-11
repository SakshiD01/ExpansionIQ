"use client";

import { useEffect, useMemo, useState } from "react";
import {
  EmptyError,
  InsightCaption,
  LoadingGrid,
  MetricCard,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, RequirementsPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

const PRIORITY_ORDER = ["Must", "Should", "Could", "Won't"] as const;

export default function RequirementsPage() {
  const [data, setData] = useState<RequirementsPayload | null>(null);
  const [filter, setFilter] = useState<"all" | "functional" | "non-functional">("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.requirements().then(setData).catch((e: Error) => setError(e.message));
  }, []);

  const items = useMemo(() => {
    if (!data) return [];
    return data.items.filter((i) => (filter === "all" ? true : i.type === filter));
  }, [data, filter]);

  if (error) {
    return (
      <ModuleShell title="Requirement Management">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }
  if (!data) {
    return (
      <ModuleShell title="Requirement Management">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  const musts = data.items.filter((i) => i.priority === "Must");
  const mustDone = musts.filter((i) => i.status === "Done" || i.status === "In Progress").length;

  return (
    <ModuleShell
      eyebrow="Framework · MoSCoW + RTM"
      title="Requirement Management"
      description="Functional and non-functional requirements for the Germany expansion, prioritised and traced to business objectives."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Requirements" value={`${data.items.length}`} />
        <MetricCard
          label="Must progress"
          value={`${mustDone}/${musts.length}`}
          hint="In progress or done"
          tone="accent"
        />
        <MetricCard
          label="Non-functional"
          value={`${data.items.filter((i) => i.type === "non-functional").length}`}
        />
      </div>

      <div className="mb-4 flex gap-2">
        {(["all", "functional", "non-functional"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs capitalize",
              filter === f
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-ink-muted"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="panel-soft overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg-soft text-xs text-ink-faint">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Requirement</th>
              <th className="px-4 py-2">MoSCoW</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Objective</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="px-4 py-3 font-mono text-xs text-ink-faint">{r.id}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{r.title}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{r.description}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-ink-faint">
                    {r.type}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 font-mono text-[11px]",
                      r.priority === "Must" && "bg-accent-soft text-accent",
                      r.priority === "Should" && "bg-bg text-warn",
                      r.priority === "Could" && "bg-bg text-ink-muted",
                      r.priority === "Won't" && "bg-bg text-ink-faint"
                    )}
                  >
                    {r.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">{r.status}</td>
                <td className="px-4 py-3 font-mono text-xs text-ink-faint">{r.objectiveId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-soft mt-6 p-5">
        <p className="eyebrow mb-3">Traceability matrix (requirement → objective)</p>
        <div className="flex flex-wrap gap-2">
          {PRIORITY_ORDER.map((p) => (
            <div key={p} className="rounded-lg border border-line bg-bg px-3 py-2">
              <p className="text-[10px] uppercase text-ink-faint">{p}</p>
              <p className="font-mono text-lg text-ink">
                {data.items.filter((i) => i.priority === p).length}
              </p>
            </div>
          ))}
        </div>
        <InsightCaption>
          Every Must maps to localisation, regulatory readiness, or beachhead objectives — BABOK-style requirements discipline for the expansion case.
        </InsightCaption>
      </div>
    </ModuleShell>
  );
}
