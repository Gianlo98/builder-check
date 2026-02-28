# BuilderCheck — AI-Powered Startup Validator

A multi-agent system that validates startup ideas in real-time. An AI orchestrator conducts an interactive interview, then dispatches 6 specialist agents in parallel to analyze every dimension of your venture — from market sizing to unit economics to go-to-market strategy.

Built with **Next.js 15**, **FastAPI**, **LangGraph**, and **Claude** (Anthropic).

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js_15-000?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?logo=langchain&logoColor=white)
![Anthropic](https://img.shields.io/badge/Claude_API-D4A574?logo=anthropic&logoColor=white)

---

## What It Does

1. **Conversational intake** — An orchestrator agent asks targeted questions to understand your idea (or skips straight to analysis if you're impatient)
2. **Parallel agent dispatch** — 6 specialist agents run simultaneously, each with web search capabilities
3. **Structured visualization** — Each agent produces structured JSON that maps to 19 distinct visualization types (radar charts, heatmaps, gauges, timelines, KPI cards, etc.)
4. **Real-time streaming** — Results stream to the UI via Server-Sent Events as each agent completes

### The 6 Specialist Agents

| Agent | What It Analyzes | Visualizations |
|-------|-----------------|----------------|
| **Market Opportunity** | TAM, growth trends, timing, adoption dynamics | Score Card, Stacked Bar, Area Chart |
| **Competitive Landscape** | Competitors, moats, feature comparison | Radar Chart, Heatmap |
| **Target Customer** | ICP, pain points, stakeholders, willingness to pay | Progress List, Entity List |
| **Business Model** | Revenue model, unit economics, pricing, projections | Bar Chart, KPI Card, Distribution, Data Table |
| **Risk Analysis** | Execution, market, regulatory, and tech risks | Gauge, Scatter Plot, Insight Callout |
| **Go-to-Market** | Channels, launch roadmap, growth projections | Timeline, Line Chart, Donut, Title Card, Horizontal Bar |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Next.js Frontend                   │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Chat UI   │  │ Markdown │  │ 19 Viz Components│ │
│  │ (SSE)     │  │ Renderer │  │ (Recharts + Zod) │ │
│  └─────┬─────┘  └──────────┘  └────────┬─────────┘ │
│        │     API Routes (proxy)         │           │
│        └──────────┬─────────────────────┘           │
└───────────────────┼─────────────────────────────────┘
                    │ SSE Stream
┌───────────────────┼─────────────────────────────────┐
│                   │   FastAPI Backend                │
│           ┌───────┴────────┐                        │
│           │  Orchestrator  │ (LangGraph + Claude)   │
│           │  Agent         │                        │
│           └──┬──┬──┬──┬──┬┘                        │
│              │  │  │  │  │  Parallel dispatch       │
│           ┌──┴──┴──┴──┴──┴──┐                      │
│           │  6 Specialist    │                      │
│           │  Agents          │ + Web Search (Tavily)│
│           └─────────────────┘                       │
│                                                     │
│  Sessions (in-memory) · Langfuse Tracing (optional) │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

**Frontend:**
- Next.js 15 (App Router) with TypeScript
- Tailwind CSS + Shadcn/ui component library
- Recharts for data visualization (19 chart types)
- Zod schemas for type-safe visualization data validation
- React Markdown with GFM support
- Framer Motion for animations
- Server-Sent Events for real-time streaming

**Backend:**
- FastAPI with SSE streaming (sse-starlette)
- LangGraph for multi-agent orchestration
- Anthropic Claude API (configurable model)
- Tavily API for real-time web search
- Langfuse for observability and tracing
- YAML-driven agent configuration

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- Anthropic API key

### Setup

```bash
# Clone the repo
git clone https://github.com/Gianlo98/builder-check.git
cd builder-check

# Backend dependencies
cd backend
uv sync
cd ..

# Frontend dependencies
npm install
```

Create a `.env` file in the project root:

```env
# Required
ANTHROPIC_API_KEY=your-key-here

# Optional — enables web search for agents
TAVILY_API_KEY=your-key-here

# Optional — enables full observability traces
LANGFUSE_PUBLIC_KEY=your-key
LANGFUSE_SECRET_KEY=your-key
LANGFUSE_HOST=https://cloud.langfuse.com

# Backend URL for API proxying
BACKEND_URL=http://localhost:8000
```

### Running

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend (port 8000)
cd backend
uv run uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend (port 3000)
npm run dev
```

Open **http://localhost:3000**, describe your startup idea, and watch the agents work.

### CLI Mode

Test the orchestrator directly in the terminal without the frontend:

```bash
cd backend
uv run python cli.py          # clean output
uv run python cli.py --debug  # full agent trace
```

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── chat/route.ts         # SSE proxy to backend
│   │   └── session/route.ts      # Session creation proxy
│   └── page.tsx
├── components/
│   ├── agents/
│   │   ├── visualizations/       # 19 viz components (recharts)
│   │   ├── AgentVizRenderer.tsx   # Dynamic viz type router
│   │   ├── CompactAgentCard.tsx   # Widget card for grid
│   │   ├── AgentDetailModal.tsx   # Full-size viz modal
│   │   └── agents-grid.tsx        # Grouped-by-agent layout
│   ├── landing/
│   │   ├── hero-section.tsx       # Landing page
│   │   └── research-input.tsx     # Chat + streaming interface
│   └── ui/                        # Shadcn/ui + custom components
├── lib/
│   ├── agents.ts                  # Agent types & config (6 agents)
│   ├── agent-widget-config.ts     # Agent → widget mapping + parser
│   ├── viz-schemas.ts             # Zod schemas for 19 viz types
│   └── viz-layout.ts              # Grid column span logic
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py        # LangGraph orchestrator
│   │   ├── specialist.py          # Specialist agent factory
│   │   ├── tools.py               # Tool registry (web search)
│   │   └── observability.py       # Langfuse tracing
│   ├── sessions/manager.py        # In-memory session store
│   ├── config/
│   │   ├── agents.yaml            # Agent prompts + viz schemas
│   │   └── questions.yaml         # Orchestrator conversation flow
│   ├── main.py                    # FastAPI server + debug logging
│   └── cli.py                     # Terminal interface
└── .env                           # API keys (not committed)
```

## Key Design Decisions

- **Agent-to-widget mapping** — Each of the 6 backend agents produces multiple frontend visualization widgets. A central config (`lib/agent-widget-config.ts`) defines which widgets each agent is responsible for, with `vizType` and `dataKey` for each.
- **Structured output** — Agent prompts include exact JSON schemas for their assigned widgets. A robust JSON extractor on both backend and frontend handles edge cases (markdown fences, preamble text, embedded JSON).
- **Grouped-by-agent UI** — The results grid groups widgets under their parent agent section, with section headers showing status. This gives a clear information hierarchy.
- **Streaming architecture** — SSE events flow from LangGraph through FastAPI to Next.js API routes to the React frontend. Events include `agent_start`, `agent_result`, `message`, and `done`.

## License

MIT
