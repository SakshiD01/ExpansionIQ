"use client";

import { useEffect, useState } from "react";
import {
  EmptyError,
  InsightCaption,
  LoadingGrid,
  MetricCard,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, StakeholdersPayload } from "@/lib/api";

export default function StakeholdersPage() {
  const [data, setData] = useState<StakeholdersPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.stakeholders().then(setData).catch((e: Error) => setError(e.message));
  }, []);

  if (error && !data) {
    return (
      <ModuleShell eyebrow="Framework · Mendelow's Matrix" title="Stakeholder Management">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }
  if (!data) {
    return (
      <ModuleShell eyebrow="Framework · Mendelow's Matrix" title="Stakeholder Management">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  const byId = Object.fromEntries(data.register.map((s) => [s.id, s]));

  return (
    <ModuleShell
      eyebrow="Framework · Mendelow's Matrix"
      title="Stakeholder Management"
      description="Power/interest grid, RACI for the expansion initiative, and a communication cadence plan."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Stakeholders" value={`${data.register.length}`} />
        <MetricCard label="RACI activities" value={`${data.raci.length}`} />
        <MetricCard label="Comms plans" value={`${data.commsPlan.length}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel-soft p-5">
          <p className="eyebrow mb-2">Power / Interest grid</p>
          <div className="relative h-80 rounded-lg border border-line bg-bg">
            <span className="absolute left-2 top-2 text-[10px] text-ink-faint">Keep satisfied</span>
            <span className="absolute right-2 top-2 text-[10px] text-ink-faint">Manage closely</span>
            <span className="absolute bottom-2 left-2 text-[10px] text-ink-faint">Monitor</span>
            <span className="absolute bottom-2 right-2 text-[10px] text-ink-faint">Keep informed</span>
            <div className="absolute left-1/2 top-0 h-full w-px bg-line" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-line" />
            {data.register.map((s) => (
              <div
                key={s.id}
                title={`${s.name} — ${s.role}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/40 bg-accent-soft px-2 py-1 text-[10px] text-accent"
                style={{
                  left: `${s.interest * 10}%`,
                  bottom: `${s.influence * 10}%`,
                }}
              >
                {s.name.split(" ")[0]}
              </div>
            ))}
          </div>
          <InsightCaption>
            CEO, CFO, and VP Sales sit in Manage Closely — board observer is high power / medium interest (Keep Satisfied).
          </InsightCaption>
        </div>

        <div className="panel-soft overflow-hidden">
          <div className="border-b border-line px-5 py-3">
            <p className="eyebrow">Stakeholder register</p>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-bg-soft text-xs text-ink-faint">
                <tr>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">P/I</th>
                </tr>
              </thead>
              <tbody>
                {data.register.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="px-4 py-2.5 text-ink">{s.name}</td>
                    <td className="px-4 py-2.5 text-ink-muted">
                      {s.role}
                      <div className="text-[11px] text-ink-faint">{s.organization}</div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-accent">
                      {s.influence}/{s.interest}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel-soft mt-6 overflow-x-auto">
        <div className="border-b border-line px-5 py-3">
          <p className="eyebrow">RACI matrix</p>
        </div>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-bg-soft text-xs text-ink-faint">
            <tr>
              <th className="px-4 py-2">Activity</th>
              <th className="px-4 py-2">R</th>
              <th className="px-4 py-2">A</th>
              <th className="px-4 py-2">C</th>
              <th className="px-4 py-2">I</th>
            </tr>
          </thead>
          <tbody>
            {data.raci.map((row) => (
              <tr key={row.activity} className="border-t border-line">
                <td className="px-4 py-2.5 text-ink">{row.activity}</td>
                <td className="px-4 py-2.5 text-ink-muted">{row.R}</td>
                <td className="px-4 py-2.5 text-ink-muted">{row.A}</td>
                <td className="px-4 py-2.5 text-ink-muted">{row.C}</td>
                <td className="px-4 py-2.5 text-ink-muted">{row.I}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-soft mt-6 p-5">
        <p className="eyebrow mb-4">Communication plan</p>
        <div className="grid gap-3 md:grid-cols-2">
          {data.commsPlan.map((c) => {
            const s = byId[c.stakeholderId];
            return (
              <div key={`${c.stakeholderId}-${c.channel}`} className="rounded-lg border border-line bg-bg p-3">
                <p className="text-sm font-medium text-ink">{s?.name ?? c.stakeholderId}</p>
                <p className="text-xs text-ink-faint">
                  {c.cadence} · {c.channel}
                </p>
                <p className="mt-2 text-xs text-ink-muted">{c.messageFocus}</p>
              </div>
            );
          })}
        </div>
      </div>
    </ModuleShell>
  );
}
