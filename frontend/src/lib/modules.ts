export const MODULES = [
  {
    href: "/workspace",
    label: "Executive Dashboard",
    short: "Dashboard",
    description: "Aggregated readiness, risk, and AI verdict",
  },
  {
    href: "/workspace/market",
    label: "Market Scoring",
    short: "Market",
    description: "CAGE + PESTEL weighted readiness",
  },
  {
    href: "/workspace/competitors",
    label: "Competitor Analysis",
    short: "Competitors",
    description: "Porter five forces & positioning",
  },
  {
    href: "/workspace/stakeholders",
    label: "Stakeholders",
    short: "Stakeholders",
    description: "Mendelow grid, RACI, comms plan",
  },
  {
    href: "/workspace/requirements",
    label: "Requirements",
    short: "Requirements",
    description: "MoSCoW register & traceability",
  },
  {
    href: "/workspace/gaps",
    label: "Gap Analysis",
    short: "Gaps",
    description: "Current vs future & McKinsey 7S",
  },
  {
    href: "/workspace/processes",
    label: "Process Mapping",
    short: "Processes",
    description: "As-is / to-be BPMN flows",
  },
  {
    href: "/workspace/financials",
    label: "Financials",
    short: "Financials",
    description: "NPV, IRR, scenario forecasts",
  },
  {
    href: "/workspace/risks",
    label: "Risk Analysis",
    short: "Risks",
    description: "Probability–impact heat map",
  },
  {
    href: "/workspace/recommendation",
    label: "AI Recommendation",
    short: "AI Verdict",
    description: "Go / no-go with reasoning trace",
  },
] as const;
