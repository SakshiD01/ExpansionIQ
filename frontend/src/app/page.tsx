"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MarketingMotion } from "@/components/marketing/MarketingMotion";
import { MODULES } from "@/lib/modules";

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export default function MarketingPage() {
  return (
    <MarketingMotion>
      <div className="min-h-screen bg-bg text-ink">
        <header className="fixed inset-x-0 top-0 z-40 border-b border-line/60 bg-bg/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <div className="font-display text-lg font-semibold tracking-tight">
              Expansion<span className="text-accent">IQ</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#modules" className="btn-ghost text-xs">
                Modules
              </a>
              <Link href="/workspace" className="btn-primary text-xs">
                Enter Workspace
              </Link>
            </div>
          </div>
        </header>

        <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pt-14">
          <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
          <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid opacity-30" />
          <div className="relative mx-auto max-w-6xl">
            <motion.p
              className="eyebrow text-accent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              Market expansion intelligence
            </motion.p>
            <motion.h1
              className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
            >
              Expansion<span className="text-accent">IQ</span>
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl text-lg text-ink-muted"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              One connected workspace for the full expansion case — from CAGE market
              scoring to AI go/no-go — built on real BABOK and consulting frameworks.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              <Link href="/workspace" className="btn-primary">
                View Harborstack → Germany demo
              </Link>
              <a href="#case" className="btn-ghost">
                See the case study
              </a>
            </motion.div>
          </div>
        </section>

        <section id="case" className="border-t border-line px-6 py-24" data-reveal>
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow">Seeded case study</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Harborstack evaluating Germany
            </h2>
            <p className="caption mt-4 max-w-2xl">
              Dublin-based B2B SaaS (€28M ARR, Series B) building the case for a
              Germany-first DACH entry — inventory intelligence for mid-market retail.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Market readiness", "74.9", "CAGE + PESTEL composite"],
                ["Base NPV", "€980K", "Positive but gated"],
                ["Verdict", "GO — Conditional", "Staged capital gates"],
              ].map(([label, value, hint]) => (
                <div key={label} className="panel-soft p-5">
                  <p className="eyebrow">{label}</p>
                  <p className="metric mt-2 text-2xl text-accent">{value}</p>
                  <p className="mt-2 text-xs text-ink-faint">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="modules" className="border-t border-line px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div data-reveal>
              <p className="eyebrow">Ten modules · one workflow</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                From scoring to synthesis
              </h2>
            </div>
            <div className="mt-12 space-y-6">
              {MODULES.map((mod, i) => (
                <motion.div
                  key={mod.href}
                  {...fade}
                  transition={{ ...fade.transition, delay: i * 0.04 }}
                  className="grid items-center gap-6 border-b border-line pb-6 md:grid-cols-[80px_1fr_auto]"
                >
                  <span className="font-mono text-sm text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold">{mod.label}</h3>
                    <p className="caption mt-1">{mod.description}</p>
                  </div>
                  <Link href={mod.href} className="btn-ghost text-xs">
                    Open
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-line px-6 py-24" data-reveal>
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Open the workspace
            </h2>
            <p className="caption mx-auto mt-4 max-w-lg">
              Fully populated demo — no empty forms. Click through the expansion case
              the way a hiring manager would in under two minutes.
            </p>
            <Link href="/workspace" className="btn-primary mt-8 inline-flex">
              Enter Workspace
            </Link>
          </div>
        </section>

        <footer className="border-t border-line px-6 py-8 text-center text-xs text-ink-faint">
          ExpansionIQ · Portfolio product · Frameworks: CAGE, PESTEL, Porter, Mendelow, MoSCoW,
          McKinsey 7S, BPMN, NPV/IRR, PMBOK risk
        </footer>
      </div>
    </MarketingMotion>
  );
}
