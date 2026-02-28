# Venture Validator

Multi-agent startup idea validator. An AI orchestrator guides you through a conversation, then dispatches 6 specialist agents (Market, Competition, Customer, Business Model, Risks, Go-to-Market) to analyze your idea.

## Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

## Setup

1. Copy `.env` and add your API keys:

```bash
cp .env.example .env
```

Required:
- `ANTHROPIC_API_KEY` — get one at https://console.anthropic.com

Optional:
- `TAVILY_API_KEY` — enables web search for agents (https://app.tavily.com)
- `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` — enables tracing (https://cloud.langfuse.com)

2. Install dependencies:

```bash
# Backend
cd backend
uv sync

# Frontend
cd ..
npm install
```

## Running

Start both servers in separate terminals:

```bash
# Terminal 1 — Backend (port 8000)
cd backend
uv run uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend (port 3000)
npm run dev
```

Open http://localhost:3000 and describe your startup idea.

Debug output (agent dispatches, results, timing) prints to the backend terminal.

## CLI mode

You can also run the orchestrator directly in the terminal without the frontend:

```bash
cd backend
uv run python cli.py          # clean output
uv run python cli.py --debug  # full agent trace
```

## Project structure

```
├── app/                  # Next.js frontend (App Router)
│   ├── api/
│   │   ├── chat/         # Proxies to backend /api/chat (SSE)
│   │   ├── session/      # Proxies to backend /api/sessions
│   │   └── validate/     # Mock endpoint (not used when backend is running)
│   └── page.tsx
├── components/
│   ├── agents/           # Agent cards and grid
│   └── landing/          # Hero section and chat input
├── lib/agents.ts         # Agent types and config
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py   # Main orchestrator (LangGraph)
│   │   ├── specialist.py     # Specialist agent factory
│   │   ├── tools.py          # Tool registry (web search)
│   │   └── observability.py  # Langfuse tracing
│   ├── sessions/manager.py   # In-memory session store
│   ├── config/
│   │   ├── agents.yaml       # 6 specialist agent definitions
│   │   └── questions.yaml    # Orchestrator conversation flow
│   ├── main.py               # FastAPI server
│   └── cli.py                # Terminal interface
└── .env                      # API keys (not committed)
```
