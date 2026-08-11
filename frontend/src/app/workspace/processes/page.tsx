"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  EmptyError,
  InsightCaption,
  LoadingGrid,
  ModuleShell,
} from "@/components/layout/ModuleShell";
import { api, ProcessesPayload, ProcessPair } from "@/lib/api";
import { cn } from "@/lib/utils";

function toFlow(pair: ProcessPair, mode: "asIs" | "toBe"): { nodes: Node[]; edges: Edge[] } {
  const graph = pair[mode];
  const nodes: Node[] = graph.nodes.map((n) => ({
    id: n.id,
    position: n.position,
    data: { label: n.label },
    style: {
      background: n.type === "gateway" ? "#15181e" : "#101216",
      border: `1px solid ${n.type === "start" || n.type === "end" ? "#2dd4a8" : "#232833"}`,
      borderRadius: n.type === "gateway" ? 4 : 10,
      color: "#f2f3f5",
      fontSize: 11,
      padding: "8px 12px",
      width: 150,
      transform: n.type === "gateway" ? "rotate(0deg)" : undefined,
    },
  }));
  const edges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7382" },
    style: { stroke: "#6b7382" },
    labelStyle: { fill: "#9aa3b2", fontSize: 10 },
  }));
  return { nodes, edges };
}

function ProcessCanvas({ pair, mode }: { pair: ProcessPair; mode: "asIs" | "toBe" }) {
  const { nodes, edges } = useMemo(() => toFlow(pair, mode), [pair, mode]);
  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 50);
  }, []);

  return (
    <div className="h-80 overflow-hidden rounded-lg border border-line bg-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={onInit}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#232833" gap={20} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

export default function ProcessesPage() {
  const [data, setData] = useState<ProcessesPayload | null>(null);
  const [tab, setTab] = useState<"orderToCash" | "regulatoryApproval">("orderToCash");
  const [mode, setMode] = useState<"asIs" | "toBe" | "compare">("compare");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.processes().then(setData).catch((e: Error) => setError(e.message));
  }, []);

  if (error) {
    return (
      <ModuleShell title="Process Mapping">
        <EmptyError message={error} />
      </ModuleShell>
    );
  }
  if (!data) {
    return (
      <ModuleShell title="Process Mapping">
        <LoadingGrid />
      </ModuleShell>
    );
  }

  const pair = data[tab];
  const title =
    tab === "orderToCash" ? "Order-to-cash (Germany)" : "Regulatory approval workflow";

  return (
    <ModuleShell
      eyebrow="Framework · BPMN-style"
      title="Process Mapping"
      description="Interactive as-is vs to-be process diagrams for the operational flows the expansion touches."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["orderToCash", "Order-to-cash"],
            ["regulatoryApproval", "Regulatory approval"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs",
              tab === key
                ? "border-accent bg-accent-soft text-accent"
                : "border-line text-ink-muted"
            )}
          >
            {label}
          </button>
        ))}
        <div className="mx-2 h-6 w-px bg-line" />
        {(["asIs", "toBe", "compare"] as const).map((m) => (
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
            {m === "asIs" ? "As-is" : m === "toBe" ? "To-be" : "Compare"}
          </button>
        ))}
      </div>

      <h2 className="mb-3 font-display text-xl font-semibold">{title}</h2>

      {mode === "compare" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-2">As-is</p>
            <ProcessCanvas pair={pair} mode="asIs" />
          </div>
          <div>
            <p className="eyebrow mb-2">To-be</p>
            <ProcessCanvas pair={pair} mode="toBe" />
          </div>
        </div>
      ) : (
        <ProcessCanvas pair={pair} mode={mode} />
      )}

      <InsightCaption>
        {tab === "orderToCash"
          ? "To-be inserts DPIA/security review, works-council gate, SEPA+DATEV billing, and Frankfurt provisioning before CSM onboarding."
          : "Regulatory path adds DPIA workshop, optional works-council consult, residency config, and DPO sign-off — no more one-page DPA shortcuts."}
      </InsightCaption>
    </ModuleShell>
  );
}
