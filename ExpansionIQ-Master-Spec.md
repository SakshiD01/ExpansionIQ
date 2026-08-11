# ExpansionIQ — Master Build Spec

**AI-Powered Global Market Expansion & Business Analysis Platform**

**Read this entire file before writing any code.** This is the single source of truth: problem, requirements, module specs, architecture, UI/UX rules, dos and don'ts, and the phased build plan. Build in the order given in "Build Plan," self-verify each phase before moving to the next, git micro-commit after each working phase, and never stop to ask "should I continue" — keep going until a phase is genuinely blocked.

---

## 1. Why This Project Exists

Most fresher business analyst portfolios show one narrow skill — a dashboard, a churn model, a SQL project. ExpansionIQ is different: it's a full simulation of what a business analyst actually does when a company asks "should we expand into this market, and how." That question touches almost every core competency in the IIBA's BABOK (Business Analysis Body of Knowledge) — stakeholder analysis, requirements elicitation, gap analysis, process design, financial modeling, and risk management — and ExpansionIQ packages all of it into one coherent, AI-assisted product, built around a real, fully-populated case study.

This is not ten disconnected features. It is one workflow: a company evaluating expansion into a new market moves through market scoring, competitive analysis, stakeholder mapping, requirements definition, gap analysis, process redesign, financial forecasting, and risk assessment — and an AI layer synthesizes all of it into a single go/no-go recommendation, surfaced on an executive dashboard. That end-to-end coherence, built on real consulting frameworks (not invented ones), is what makes this look like an actual product rather than a student project.

---

## 2. The Problem It Solves

When a company considers entering a new market, the analysis is usually scattered across spreadsheets, slide decks, and someone's head: a market research doc here, a stakeholder list in an email thread, requirements in a Word file, a rough P&L in Excel, risks mentioned in a meeting nobody wrote down. Nothing talks to anything else, and by the time it reaches the executive team, it's a patchwork, not a coherent case.

ExpansionIQ solves this by giving a business analyst one structured workspace where every piece of the expansion case — market attractiveness, competitors, stakeholders, requirements, capability gaps, operational processes, financial viability, and risk — lives in one connected model, and an AI recommendation engine reads across all of it to produce the kind of synthesized judgment call a senior consultant would give.

---

## 3. Who It's For

Primary persona: a business analyst or strategy team member building the case for (or against) entering a new market. Secondary persona (the one that actually matters for the portfolio): the hiring manager or recruiter opening the CV link, who should be able to click through a fully populated, realistic expansion case in under two minutes and immediately understand that the candidate thinks in the same frameworks a real BA or consulting team does.

**Ship with one complete, realistic seed case study already loaded** — e.g. a mid-size SaaS or consumer company evaluating expansion from Ireland into Germany. Every module must have real-looking data from the moment the site loads. A recruiter will never fill in empty forms themselves; an empty-state demo is a dead demo.

---

## 4. Core Modules — Detailed Specs

### 4.1 Executive Dashboard
The landing view inside the app. Aggregates every other module into one screen: overall market readiness score, aggregated risk score, top 3 competitive threats, financial headline numbers (projected revenue, break-even timeline, NPV), stakeholder alignment summary, requirement completion status, and the AI recommendation engine's headline verdict — each as a card that drills down into its full module. This is built last (Phase 11) because it depends on every other module's real output, not placeholder numbers.

### 4.2 Market Scoring Engine
A weighted multi-criteria scoring model, not a single "market size" number. Score the target market against dimensions drawn from the **CAGE Distance Framework** (Cultural, Administrative, Geographic, Economic distance from the home market) plus a **PESTEL** layer (Political, Economic, Social, Technological, Environmental, Legal). User can adjust criterion weights (an AHP-lite pairwise-weighting or simple slider-based weighting), and the engine recalculates a composite 0–100 readiness score live. Output includes a radar/spider chart of the dimensions and a one-paragraph AI-generated narrative explaining the score.

### 4.3 Competitor Analysis
**Porter's Five Forces** assessment for the target market (threat of new entrants, supplier power, buyer power, threat of substitutes, competitive rivalry), each force scored and justified. A competitive positioning map (2×2 matrix, axes configurable — e.g. price vs. quality, or local vs. global reach) plotting named competitors. Per-competitor mini-SWOT. This module should feel like a real competitive intelligence brief, not a table of logos.

### 4.4 Stakeholder Management
A stakeholder register (name, role, organization, influence) driving a **Power/Interest grid** (Mendelow's Matrix) — plotted visually, not just listed — plus a generated RACI matrix for the expansion initiative and a communication plan (who needs what, how often). This is a core, distinctly "business analyst" (not data-scientist) technique — make sure it's visually strong, not an afterthought table.

### 4.5 Requirement Management
A requirements register split into functional and non-functional requirements for the expansion initiative (e.g. "must support EUR and local payment methods," "must comply with GDPR and local data residency law"), each with a status, priority via **MoSCoW** (Must/Should/Could/Won't), and a requirements traceability matrix linking each requirement back to a business objective. This is the module that most directly signals "I know BABOK," which matters because job descriptions for BA roles cite it constantly.

### 4.6 Gap Analysis
Current-state vs. future-state comparison across capability areas (e.g. local sales team, regulatory licenses, supply chain, localized product, payment infrastructure), each scored on a gap-severity scale, optionally framed through the **McKinsey 7S** lens (Strategy, Structure, Systems, Shared Values, Skills, Style, Staff) for organizational readiness gaps specifically. Each gap generates a suggested closing action with an estimated cost/time to close — this feeds Financial Forecasting and Risk Analysis.

### 4.7 Process Mapping
Interactive **BPMN-style** as-is vs. to-be process diagrams for the core operational processes the expansion touches (e.g. order-to-cash for the new market, regulatory approval workflow, local distribution setup). Use an interactive node-based diagramming library (React Flow) — not a static image — so a viewer can visually compare the current process against the redesigned one and see exactly where new steps or approvals are added.

### 4.8 Financial Forecasting
Revenue projection model for the new market (bottoms-up: target segment size × penetration curve × average revenue per account, with adjustable assumptions), entry cost modeling (one-off setup + ongoing costs), break-even analysis, and NPV/IRR calculation over a 3–5 year horizon. Three scenarios always shown together — best case, base case, worst case — never a single-line forecast, because a single-line forecast is exactly the kind of false precision a real analyst avoids. Include a simple FX-sensitivity toggle if the target market uses a different currency.

### 4.9 Risk Analysis
A risk register (regulatory, operational, financial, competitive, reputational risks specific to the expansion), each scored on a **probability-impact matrix** (a proper heat map, not a list) per standard PMBOK risk-management convention, with mitigation actions and residual risk after mitigation. Optionally: a lightweight Monte Carlo simulation on the financial forecast (varying penetration rate and cost assumptions) to show a distribution of possible NPV outcomes rather than a single number — a strong, differentiating stretch feature if time allows.

### 4.10 AI Recommendation Engine
The synthesis layer. Reads the actual outputs of every module above — market score, competitive threat level, stakeholder alignment, requirement completeness, gap severity, financial viability (NPV/break-even), and aggregate risk — and generates a structured go/no-go recommendation with a visible reasoning trace (which factors weighed in which direction, not just a black-box verdict), in the same plain-English, business-first style used across your other AI portfolio projects. Use the Gemini free-tier API, consistent with the rest of your stack.

---

## 5. Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Motion/Scroll:** Framer Motion for in-app micro-interactions; Lenis (smooth scroll) + GSAP ScrollTrigger for the marketing/product storytelling page (section 7 below) — if your `scroll-film-studio` skill is available in this build environment, use it for the hero and module-reveal scroll sequences rather than hand-rolling the scroll choreography
- **Data viz:** Recharts (radar charts, financial projections, risk heat maps) and React Flow (process mapping diagrams, competitive positioning map)
- **Backend:** FastAPI (Python) for scoring calculations, financial modeling math (NPV/IRR/break-even), and the AI recommendation synthesis call
- **AI:** Google Gemini API (free tier), same pattern as InsightPilot
- **Database:** Neon Postgres (free tier) — stores the seed case study and any user-adjusted scenario data
- **Hosting:** Frontend on Vercel, backend on Render, both free tier
- **Repo:** new GitHub repo, e.g. `git@github.com:vedjr02/ExpansionIQ.git`, branch `main`

---

## 6. Architecture Overview

```
Marketing / product page (scroll-driven story of all 10 modules)
        │  "Enter Workspace" →
        ▼
App shell (persistent nav across 10 modules + Executive Dashboard)
        │
        ├── Market Scoring Engine ──┐
        ├── Competitor Analysis ────┤
        ├── Stakeholder Management ─┤
        ├── Requirement Management ─┤        each module reads/writes
        ├── Gap Analysis ───────────┼──────▶ its slice of the case-study
        ├── Process Mapping ────────┤        model in Neon Postgres via
        ├── Financial Forecasting ──┤        FastAPI endpoints
        ├── Risk Analysis ──────────┘
        │
        ▼
AI Recommendation Engine (FastAPI → Gemini)
  reads the current state of ALL modules, synthesizes a verdict
        │
        ▼
Executive Dashboard
  aggregates every module + the AI verdict into one view
```

---

## 7. UI/UX Rules — This Must Look and Feel Like a Real Product

This is the most important section. The bar is: **does this look like something a company would actually pay for**, not "does this look like a student project with charts on it."

**Design language and references**
Study, and design toward, the visual language of: **Linear** (data-dense but calm, confident dark mode, restrained motion), **Stripe's product/marketing pages** (scroll-driven storytelling, generous whitespace, one idea per screen), **Attio** (CRM-grade data tables and relationship visualizations done cleanly), and **Vercel's dashboard** (metric cards, monospace numerics, clear information hierarchy). Do not default to generic AI-SaaS clichés: no purple-to-blue gradients, no glassmorphism used decoratively, no default shadcn component styling left untouched, no stock "AI sparkle" icon abuse.

**Two distinct experiences, both required**
1. **Marketing/product page** (public, no login) — a single scroll-driven narrative page that tells the ExpansionIQ story: hero, then one section per module as the user scrolls, each revealing a real (or realistic-looking) visualization from that module as it comes into view, pinned/parallax sections in the Stripe/Linear style. This is what a recruiter sees first and it needs to sell the product in 60 seconds of scrolling.
2. **The actual workspace app** — the ten modules plus Executive Dashboard, fully functional against the seeded case study, reachable via an "Enter Workspace" or "View Demo" call to action from the marketing page.

**Visual system**
- Dark mode as the default (enterprise SaaS convention — Linear, Vercel, Attio are all dark-first); light mode as a toggle if time allows, not required
- A real typographic scale and a distinctive typeface pairing — avoid the default Inter-everywhere look; pick something with more character for headings if it fits the palette
- Consistent 8pt spacing grid across every module so the ten different modules feel like one product, not ten separate mini-projects glued together
- Every chart/diagram gets a one-line plain-English caption — this is a business analysis tool, so the insight must always be legible even to a non-technical viewer
- Motion is purposeful: scroll reveals on the marketing page, smooth transitions between dashboard states, subtle hover/focus states in the workspace — never decorative animation with no informational purpose

---

## 8. Do's and Don'ts

**Do:**
- Ship with the full seed case study populated in every single module before anything else is polished — an empty module kills the demo instantly
- Use real business frameworks correctly (CAGE, PESTEL, Porter's Five Forces, Mendelow's Matrix, RACI, MoSCoW, McKinsey 7S, BPMN, NPV/IRR, probability-impact risk matrix) — get the mechanics right, since a BA-literate reviewer will notice if they're faked
- Keep all ten modules visually and structurally consistent (same card system, same chart library conventions, same spacing) so the product feels unified
- Make the AI Recommendation Engine's reasoning visible — show which module outputs drove the verdict, not just a final sentence
- Always show scenario ranges (best/base/worst) in financial forecasting, never a single deterministic number

**Don't:**
- Don't build the Executive Dashboard first — it aggregates other modules' real data and will look fake if built before they exist
- Don't use decorative gradients, glassmorphism, or stock AI iconography as a substitute for real design decisions
- Don't let any module become a static table with no interactivity — the positioning map, power/interest grid, process diagrams, and risk heat map all need to be visually plotted, not just listed
- Don't build user authentication, multi-tenant accounts, or the ability to create additional case studies from scratch — one excellent, fully-realized seed case study beats a half-built multi-case system
- Don't skip the marketing/product scroll page — for a portfolio piece, first impression is the whole game

---

## 9. Build Plan (phased — build and self-verify in this order)

**Phase 0 — Scaffold, design system, seed case study**
Initialize Next.js frontend and FastAPI backend, connect Neon Postgres, define and seed the full case-study dataset (company, target market, all module data) that every later phase will build against. Establish the design system (colors, type scale, spacing, base components) before building any module screen.

**Phase 1 — App shell + Executive Dashboard shell**
Persistent navigation across all modules. Executive Dashboard built with placeholder/loading cards for now — will be wired to real data in Phase 11.

**Phase 2 — Market Scoring Engine**
CAGE + PESTEL scoring model, adjustable weights, radar chart, AI narrative. Verify the composite score recalculates correctly when weights change.

**Phase 3 — Competitor Analysis**
Porter's Five Forces scoring, positioning map, per-competitor mini-SWOT.

**Phase 4 — Stakeholder Management**
Stakeholder register, Power/Interest grid, RACI matrix, communication plan.

**Phase 5 — Requirement Management**
Functional/non-functional requirements register, MoSCoW prioritization, traceability matrix.

**Phase 6 — Gap Analysis**
Current vs. future state comparison, McKinsey 7S-framed gaps, severity scoring, suggested closing actions.

**Phase 7 — Process Mapping**
React Flow-based as-is vs. to-be BPMN-style diagrams for at least two core processes.

**Phase 8 — Financial Forecasting**
Revenue model, entry costs, break-even, NPV/IRR, three scenarios, FX sensitivity toggle.

**Phase 9 — Risk Analysis**
Risk register, probability-impact heat map, mitigation actions, residual risk. Add Monte Carlo simulation on the financial forecast if time allows.

**Phase 10 — AI Recommendation Engine**
Wire the FastAPI → Gemini call that reads every module's current output and produces the synthesized, reasoning-visible go/no-go verdict.

**Phase 11 — Executive Dashboard, fully wired**
Replace every placeholder card with real aggregated data from Phases 2–10, including the AI verdict headline.

**Phase 12 — Marketing/product scroll page**
Build the public scroll-driven story page: hero, then one pinned/reveal section per module showing a real visualization pulled from the seeded data.

**Phase 13 — Polish pass**
Motion consistency, dark mode refinement, responsive check, cross-module visual consistency audit, final deploy check on Vercel + Render.

---

## 10. Success Criteria / What This Should Prove on the CV

By the end, Ved should be able to say: "I built an end-to-end market expansion analysis platform covering market scoring, competitive analysis, stakeholder management, requirements management, gap analysis, process mapping, financial forecasting, risk analysis, and an AI recommendation engine — built on real BABOK, Porter, CAGE, and PMBOK frameworks, with a product-quality scroll-driven presentation." That is a portfolio piece that reads like a consulting deliverable and a real SaaS product at the same time — not a student project.

---

## 11. First Prompt for Claude Code

Copy the block below as the first message to Claude Code in the new project directory.

```
Read ExpansionIQ-Master-Spec.md in full before doing anything else — it is
the single source of truth for this project's requirements, module specs,
architecture, UI/UX rules, dos and don'ts, and build plan.

This project has two audiences that both matter: the app must be
genuinely functional across all ten modules, and it must look and feel
like a real, polished product — not a student project with charts on it.
Read section 7 (UI/UX Rules) especially carefully before writing any UI
code, and hold every screen to that bar.

Build this project by working through the phases in section 9, in order.
Phase 0 is critical: the full seed case study must be real and complete
before any module UI is built, since every later phase depends on it
looking populated, not empty. After each phase: verify it works
correctly, git commit with a clear message, then move to the next phase
without stopping to ask permission, unless you hit a genuine blocker
(missing credential, ambiguous requirement not covered in the spec, or a
failing verification you can't resolve).

Start with Phase 0 now: scaffold the Next.js frontend and FastAPI
backend, connect Neon Postgres, define and seed the full case-study
dataset, and establish the design system. Ask me for the Neon connection
string and confirm the GitHub repo URL before you begin, then proceed
autonomously through the phases.
```
