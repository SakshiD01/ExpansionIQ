const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string }>("/api/health"),
  case: () => request<Record<string, unknown>>("/api/case"),
  caseMeta: () => request<CaseMeta>("/api/case/meta"),
  dashboard: () => request<DashboardPayload>("/api/dashboard"),
  marketScoring: () => request<MarketScoringPayload>("/api/market-scoring"),
  recalculateMarket: (weights: Record<string, number>) =>
    request<MarketScoringPayload>("/api/market-scoring/recalculate", {
      method: "POST",
      body: JSON.stringify({ weights }),
    }),
  competitors: () => request<CompetitorsPayload>("/api/competitors"),
  stakeholders: () => request<StakeholdersPayload>("/api/stakeholders"),
  requirements: () => request<RequirementsPayload>("/api/requirements"),
  gaps: () => request<GapsPayload>("/api/gaps"),
  processes: () => request<ProcessesPayload>("/api/processes"),
  financials: (fxMult = 1) =>
    request<FinancialsPayload>(`/api/financials?fxMult=${fxMult}`),
  monteCarlo: (runs = 500) =>
    request<MonteCarloPayload>(`/api/financials/monte-carlo?runs=${runs}`),
  risks: () => request<RisksPayload>("/api/risks"),
  recommendation: () => request<RecommendationPayload>("/api/recommendation"),
};

export type CaseMeta = {
  id: string;
  company: {
    name: string;
    hq: string;
    arrEur: number;
    stage: string;
    product: string;
    homeMarket: string;
  };
  targetMarket: {
    country: string;
    region: string;
    currency: string;
    entryYear: number;
    rationale: string;
  };
  businessObjectives: { id: string; title: string; description: string }[];
};

export type DashboardPayload = {
  caseStudy: CaseMeta;
  signals: {
    marketReadiness: number;
    competitiveThreat: number;
    stakeholderAlignment: number;
    requirementCompletion: number;
    gapSeverity: number;
    financial: {
      npv: number;
      irr: number | null;
      breakEvenMonth: number | null;
      year5Revenue: number;
    };
    riskAggregate: number;
    residualRiskAggregate: number;
    topCompetitiveThreats: { id: string; name: string; localDepth: number }[];
  };
  recommendation: {
    verdict: string;
    confidence: number;
    headline: string;
    source: string;
  };
};

export type MarketScoringPayload = {
  composite: number;
  dimensions: {
    id: string;
    framework: string;
    name: string;
    score: number;
    weight?: number;
    effectiveWeight?: number;
    justification: string;
  }[];
  narrative: string;
  defaultWeights?: Record<string, number>;
  weightSum?: number;
};

export type CompetitorsPayload = {
  fiveForces: { force: string; score: number; justification: string }[];
  positioningAxes: { x: string; y: string };
  competitors: {
    id: string;
    name: string;
    x: number;
    y: number;
    isSelf?: boolean;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
  }[];
};

export type StakeholdersPayload = {
  register: {
    id: string;
    name: string;
    role: string;
    organization: string;
    influence: number;
    interest: number;
    category: string;
  }[];
  raci: { activity: string; R: string; A: string; C: string; I: string }[];
  commsPlan: {
    stakeholderId: string;
    cadence: string;
    channel: string;
    messageFocus: string;
  }[];
};

export type RequirementsPayload = {
  items: {
    id: string;
    type: string;
    title: string;
    description: string;
    priority: "Must" | "Should" | "Could" | "Won't";
    status: string;
    objectiveId: string;
  }[];
};

export type GapsPayload = {
  items: {
    id: string;
    area: string;
    currentState: string;
    futureState: string;
    severity: number;
    mckinsey7s: string;
    closingAction: string;
    estimatedCostEur: number;
    estimatedMonths: number;
  }[];
  sevenS: {
    element: string;
    currentScore: number;
    targetScore: number;
    notes: string;
  }[];
};

export type ProcessesPayload = {
  orderToCash: ProcessPair;
  regulatoryApproval: ProcessPair;
};

export type ProcessPair = {
  asIs: { nodes: ProcessNode[]; edges: ProcessEdge[] };
  toBe: { nodes: ProcessNode[]; edges: ProcessEdge[] };
};

export type ProcessNode = {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
};

export type ProcessEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
};

export type FinancialsPayload = {
  assumptions: Record<string, number | string>;
  scenarios: Record<
    string,
    {
      setupCost: number;
      revenueByYear: number[];
      opexByYear: number[];
      cashflowByYear: number[];
      npv: number;
      irr: number | null;
      breakEvenMonth: number | null;
    }
  >;
  fxMult: number;
};

export type MonteCarloPayload = {
  runs: number;
  mean: number;
  p10: number;
  p50: number;
  p90: number;
  min: number;
  max: number;
};

export type RisksPayload = {
  items: {
    id: string;
    title: string;
    category: string;
    probability: number;
    impact: number;
    mitigation: string;
    residualProbability: number;
    residualImpact: number;
  }[];
  inherent: { aggregate: number; count: number; highCount: number };
  residual: { aggregate: number; count: number; highCount: number };
};

export type RecommendationPayload = {
  verdict: string;
  confidence: number;
  headline: string;
  reasoning: {
    factor: string;
    direction: string;
    detail: string;
    weight?: number;
    value?: number;
  }[];
  source: string;
  signals?: DashboardPayload["signals"];
};
