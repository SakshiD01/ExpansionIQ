"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function ModuleHeader({ eyebrow, title, description, actions }: Omit<Props, "children">) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {description ? <p className="caption mt-2 max-w-xl">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function ModuleShell({ children, ...header }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-7xl px-6 py-8 lg:px-8"
    >
      <ModuleHeader {...header} />
      {children}
    </motion.div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "accent" | "warn" | "danger";
}) {
  const toneClass =
    tone === "accent"
      ? "text-accent"
      : tone === "warn"
        ? "text-warn"
        : tone === "danger"
          ? "text-danger"
          : "text-ink";

  return (
    <div className="panel-soft p-4">
      <p className="eyebrow">{label}</p>
      <p className={`metric mt-2 text-2xl ${toneClass}`}>{value}</p>
      {hint ? <p className="mt-2 text-xs text-ink-faint">{hint}</p> : null}
    </div>
  );
}

export function InsightCaption({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 border-l-2 border-accent/40 pl-3 text-sm text-ink-muted">{children}</p>
  );
}

export function EmptyError({ message }: { message: string }) {
  return (
    <div className="panel-soft p-8 text-center">
      <p className="text-sm text-danger">{message}</p>
      <p className="mt-2 text-xs text-ink-faint">
        Ensure the FastAPI backend is running on port 8000.
      </p>
    </div>
  );
}

export function LoadingGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="panel-soft h-28 animate-pulse bg-bg-soft/80" />
      ))}
    </div>
  );
}
