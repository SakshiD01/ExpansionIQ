# ExpansionIQ

AI-powered global market expansion & business analysis platform.

**Case study:** Harborstack (Dublin B2B SaaS) evaluating expansion into Germany.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, Framer Motion, Recharts, React Flow
- **Backend:** FastAPI, SQLAlchemy (SQLite locally / Neon Postgres when `DATABASE_URL` is set)
- **AI:** Google Gemini (optional `GEMINI_API_KEY`) with deterministic rule-engine fallback

## Quick start

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # optional: DATABASE_URL, GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # or use existing .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Enter Workspace**.

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Modules

1. Executive Dashboard  
2. Market Scoring (CAGE + PESTEL)  
3. Competitor Analysis (Porter + positioning)  
4. Stakeholder Management (Mendelow + RACI)  
5. Requirement Management (MoSCoW + RTM)  
6. Gap Analysis (McKinsey 7S)  
7. Process Mapping (React Flow BPMN)  
8. Financial Forecasting (NPV/IRR scenarios)  
9. Risk Analysis (probability–impact heat map)  
10. AI Recommendation Engine  

## Spec

See `ExpansionIQ-Master-Spec.md` for full requirements and build plan.
