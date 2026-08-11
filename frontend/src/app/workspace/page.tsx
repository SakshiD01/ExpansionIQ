"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  EmptyError,
  LoadingGrid,
  MetricCard,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, DashboardPayload } from "@/lib/api";
import { formatEur, formatMonths } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <ModuleShell title="Executive Dashboard" description="Aggregated expansion case view">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }

  if (!data) {
    return (
      <ModuleShell title="Executive Dashboard" description="Loading Harborstack case…">
        <LoadingGrid count={8} />
      </ModuleShell>
    );
  }

  const { signals, recommendation, caseStudy } = data;

  return (
    <ModuleShell
      eyebrow="Case study · Harborstack → Germany"
      title="Executive Dashboard"
      description={`${caseStudy.company.product}. Evaluating entry into ${caseStudy.targetMarket.country} (${caseStudy.targetMarket.region}).`}
      actions={
        <Link href="/workspace/recommendation" className="btn-primary">
          Open AI verdict
        </Link>
      }
    >
      <section className="mb-6 panel overflow-hidden">
        <div className="border-b border-line bg-accent-soft/40 px-5 py-4">
          <p className="eyebrow text-accent">AI recommendation</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
            {recommendation.verdict}
          </h2>
          <p className="caption mt-2 max-w-3xl">{recommendation.headline}</p>
        </div>
        <div className="grid gap-px bg-line sm:grid-cols-3">
          <div className="bg-bg-elev p-4">
            <p className="eyebrow">Confidence</p>
            <p className="metric mt-1 text-xl">{recommendation.confidence}</p>
          </div>
          <div className="bg-bg-elev p-4">
            <p className="eyebrow">Source</p>
            <p className="mt-1 font-mono text-sm text-ink-muted">{recommendation.source}</p>
          </div>
          <div className="bg-bg-elev p-4">
            <p className="eyebrow">Case</p>
            <p className="mt-1 text-sm text-ink-muted">{caseStudy.id}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/workspace/market">
          <MetricCard
            label="Market readiness"
            value={`${signals.marketReadiness}`}
            hint="CAGE + PESTEL composite / 100"
            tone="accent"
          />
        </Link>
        <Link href="/workspace/risks">
          <MetricCard
            label="Risk aggregate"
            value={`${signals.riskAggregate}`}
            hint={`Residual after mitigation: ${signals.residualRiskAggregate}`}
            tone={signals.riskAggregate > 55 ? "warn" : "default"}
          />
        </Link>
        <Link href="/workspace/financials">
          <MetricCard
            label="Base NPV"
            value={formatEur(signals.financial.npv, true)}
            hint={`Break-even ${formatMonths(signals.financial.breakEvenMonth)}`}
          />
        </Link>
        <Link href="/workspace/financials">
          <MetricCard
            label="Y5 revenue (base)"
            value={formatEur(signals.financial.year5Revenue, true)}
            hint="Bottoms-up mid-market model"
          />
        </Link>
        <Link href="/workspace/competitors">
          <MetricCard
            label="Competitive threat"
            value={`${signals.competitiveThreat}`}
            hint="Buyer power + rivalry index"
            tone="warn"
          />
        </Link>
        <Link href="/workspace/stakeholders">
          <MetricCard
            label="Stakeholder alignment"
            value={`${signals.stakeholderAlignment}%`}
            hint="High influence × high interest"
          />
        </Link>
        <Link href="/workspace/requirements">
          <MetricCard
            label="Must-have progress"
            value={`${signals.requirementCompletion}%`}
            hint="Must requirements in progress or done"
          />
        </Link>
        <Link href="/workspace/gaps">
          <MetricCard
            label="Gap severity"
            value={`${signals.gapSeverity}`}
            hint="Average capability gap index"
            tone={signals.gapSeverity > 60 ? "danger" : "warn"}
          />
        </Link>
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="panel-soft p-5">
          <p className="eyebrow">Top competitive threats</p>
          <ul className="mt-4 space-y-3">
            {signals.topCompetitiveThreats.map((t, i) => (
              <li
                key={t.id}
                className="flex items-center justify-between border-b border-line pb-3 last:border-0"
              >
                <span className="text-sm text-ink">
                  <span className="mr-2 font-mono text-ink-faint">{i + 1}.</span>
                  {t.name}
                </span>
                <span className="font-mono text-xs text-ink-muted">
                  Local depth {t.localDepth}
                </span>
              </li>
            ))}
          </ul>
          <p className="caption mt-3">
            Incumbents with deeper German retail coverage set the competitive bar for Harborstack&apos;s beachhead.
          </p>
        </div>
        <div className="panel-soft p-5">
          <p className="eyebrow">Business objectives</p>
          <ul className="mt-4 space-y-3">
            {caseStudy.businessObjectives.slice(0, 4).map((o) => (
              <li key={o.id}>
                <p className="text-sm font-medium text-ink">{o.title}</p>
                <p className="text-xs text-ink-faint">{o.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </ModuleShell>
  );
}
