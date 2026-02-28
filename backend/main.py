"""FastAPI server with debug terminal output.

Run with: uv run uvicorn main:app --reload --port 8000
"""

import json
import time
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from agents.orchestrator import create_orchestrator
from agents.observability import get_langfuse_handler, flush_langfuse, langfuse_config
from agents.specialist import get_agent_labels
from sessions.manager import SessionManager

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

session_mgr = SessionManager()
_orchestrator = None
AGENT_LABELS: dict[str, str] = {}


# ---------------------------------------------------------------------------
# ANSI colors for terminal debug output
# ---------------------------------------------------------------------------

class C:
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    DIM     = "\033[2m"
    RED     = "\033[31m"
    GREEN   = "\033[32m"
    YELLOW  = "\033[33m"
    BLUE    = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN    = "\033[36m"
    WHITE   = "\033[37m"


AGENT_COLORS = {
    "orchestrator": C.CYAN,
    "model":        C.CYAN,
    "market":       C.GREEN,
    "competition":  C.MAGENTA,
    "customer":     C.YELLOW,
    "business_model": C.BLUE,
    "risks":        C.RED,
    "gtm":          C.WHITE,
}


def _color_for(node: str) -> str:
    for key, color in AGENT_COLORS.items():
        if key in node:
            return color
    return C.DIM


def _label_for(node: str) -> str:
    for key, label in AGENT_LABELS.items():
        if key in node:
            return label
    if node == "model":
        return "Orchestrator"
    return node


_SILENT_NODES = {"", "__start__"}
_at_line_start = True


def _reset_line_state():
    global _at_line_start
    _at_line_start = True


def _log(msg: str):
    print(msg, flush=True)


def _log_header(node: str, extra: str = ""):
    color = _color_for(node)
    label = _label_for(node)
    tag = f" {extra}" if extra else ""
    bar = "─" * max(1, 50 - len(label) - len(tag))
    _log(f"\n{color}{C.BOLD}┌─ {label}{tag} {bar}{C.RESET}")
    _reset_line_state()


def _log_text(node: str, text: str):
    global _at_line_start
    color = _color_for(node)
    out = ""
    for ch in text:
        if _at_line_start:
            out += f"{color}│ {C.RESET}"
            _at_line_start = False
        if ch == "\n":
            out += ch
            _at_line_start = True
        else:
            out += ch
    print(out, end="", flush=True)


def _log_footer(node: str, elapsed: float = 0):
    color = _color_for(node)
    _log(f"\n{color}{C.BOLD}└{'─' * 52}{C.RESET}")
    if elapsed:
        _log(f"{C.DIM}  ({elapsed:.1f}s){C.RESET}")


def _log_dispatch(node: str, agent_id: str, description: str = ""):
    color = _color_for(node)
    agent_color = _color_for(agent_id)
    label = AGENT_LABELS.get(agent_id, agent_id)
    _log(f"\n{color}│")
    _log(f"{color}│ {C.BOLD}>> DISPATCH: {agent_color}{label} ({agent_id}){C.RESET}")
    if description:
        lines = description.strip().split("\n")
        _log(f"{color}│ {C.DIM}   Input:{C.RESET}")
        for line in lines[:6]:
            _log(f"{color}│ {C.DIM}     {line[:120]}{C.RESET}")
        if len(lines) > 6:
            _log(f"{color}│ {C.DIM}     ...({len(lines)-6} more lines){C.RESET}")


def _log_result(node: str, agent_id: str, text: str):
    color = _color_for(node)
    agent_color = _color_for(agent_id)
    label = AGENT_LABELS.get(agent_id, agent_id)
    _log(f"\n{color}│")
    _log(f"{color}│ {C.GREEN}{C.BOLD}<< RESULT from {agent_color}{label}{C.GREEN}{C.BOLD}:{C.RESET}")
    lines = [l for l in text.strip().split("\n") if l.strip()][:6]
    for line in lines:
        truncated = line[:120] + ("..." if len(line) > 120 else "")
        _log(f"{color}│ {C.DIM}   {truncated}{C.RESET}")
    remaining = len([l for l in text.strip().split("\n") if l.strip()]) - 6
    if remaining > 0:
        _log(f"{color}│ {C.DIM}   ...({remaining} more lines){C.RESET}")
    _log(f"{color}│")


# ---------------------------------------------------------------------------
# Text extraction
# ---------------------------------------------------------------------------

def _extract_text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(
            block.get("text", "")
            for block in content
            if isinstance(block, dict) and block.get("type") == "text"
        )
    return ""


def _identify_agent(tc_id: str, buffers: dict, result_text: str) -> str:
    if tc_id and tc_id in buffers:
        try:
            args = json.loads(buffers[tc_id])
            return args.get("subagent_type", "")
        except (json.JSONDecodeError, ValueError):
            pass
    lower = result_text[:500].lower()
    if "market" in lower and "tam" in lower:
        return "market"
    if "competi" in lower:
        return "competition"
    if "customer" in lower and ("icp" in lower or "persona" in lower):
        return "customer"
    if "revenue" in lower and "model" in lower:
        return "business_model"
    if "risk" in lower:
        return "risks"
    if "go-to-market" in lower or "gtm" in lower or "launch" in lower:
        return "gtm"
    return ""


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _orchestrator, AGENT_LABELS
    _orchestrator = create_orchestrator()
    AGENT_LABELS = get_agent_labels()
    get_langfuse_handler()
    _log(f"\n{'=' * 60}")
    _log(f"  Venture Validator API — {C.GREEN}Ready{C.RESET}")
    _log(f"  {C.YELLOW}{C.BOLD}DEBUG MODE{C.RESET} — all agent I/O logged to terminal")
    _log(f"{'=' * 60}\n")
    yield
    flush_langfuse()


app = FastAPI(
    title="Venture Validator API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    session_id: str
    message: str


class SessionResponse(BaseModel):
    session_id: str
    thread_id: str


@app.post("/api/sessions", response_model=SessionResponse)
def create_session():
    session = session_mgr.create_session()
    _log(f"\n{C.GREEN}+ New session: {session.session_id}{C.RESET}")
    return SessionResponse(session_id=session.session_id, thread_id=session.thread_id)


@app.get("/api/sessions/{session_id}")
def get_session(session_id: str):
    session = session_mgr.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": session.session_id,
        "thread_id": session.thread_id,
        "message_count": len(session.messages),
        "agent_results": session.agent_results,
    }


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Stream orchestrator responses as SSE with terminal debug logging."""
    session = session_mgr.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.add_user_message(req.message)
    _log(f"\n{'─' * 60}")
    _log(f"{C.BOLD}You:{C.RESET} {req.message}")

    async def event_generator():
        config = langfuse_config(
            thread_id=session.thread_id,
            session_id=session.session_id,
        )
        input_msg = {"messages": [{"role": "user", "content": req.message}]}

        full_response = ""
        last_node = None
        t_start = time.time()
        task_args_buffers: dict[str, str] = {}
        task_dispatched: set[str] = set()
        current_tc_id: str | None = None

        for chunk, metadata in _orchestrator.stream(
            input_msg, config=config, stream_mode="messages"
        ):
            node = metadata.get("langgraph_node", "")
            chunk_type = getattr(chunk, "type", "")

            if node != last_node and node not in _SILENT_NODES:
                if last_node and last_node not in _SILENT_NODES:
                    _log_footer(last_node, time.time() - t_start)
                _log_header(node)
                last_node = node

            # --- AI message chunks ---
            if chunk_type in ("AIMessageChunk", "ai"):
                text = _extract_text(chunk.content)
                if text:
                    if node == "model":
                        full_response += text
                    _log_text(node, text)
                    yield {
                        "event": "message",
                        "data": json.dumps({"content": text, "node": node}),
                    }

                # Tool call starts (have name + id)
                tc = getattr(chunk, "tool_calls", None)
                if tc:
                    for call in tc:
                        name = call.get("name", "")
                        tc_id = call.get("id", "")
                        if name and tc_id:
                            current_tc_id = tc_id
                            task_args_buffers[tc_id] = ""

                # Tool call arg streaming
                tc_chunks = getattr(chunk, "tool_call_chunks", None)
                if tc_chunks:
                    for tcc in tc_chunks:
                        tc_id = tcc.get("id") or current_tc_id
                        frag = tcc.get("args", "")
                        if tc_id and frag:
                            task_args_buffers.setdefault(tc_id, "")
                            task_args_buffers[tc_id] += frag

                        if tc_id and tc_id not in task_dispatched:
                            raw = task_args_buffers.get(tc_id, "")
                            try:
                                args = json.loads(raw)
                                task_dispatched.add(tc_id)
                                agent_id = args.get("subagent_type", "")
                                if agent_id:
                                    description = args.get("description", "")
                                    _log_dispatch(node, agent_id, description)
                                    yield {
                                        "event": "agent_start",
                                        "data": json.dumps({"agentId": agent_id}),
                                    }
                            except (json.JSONDecodeError, ValueError):
                                pass

            # --- Tool results (specialist agent responses) ---
            if chunk_type in ("tool", "ToolMessage"):
                tc_id = getattr(chunk, "tool_call_id", "")
                result_text = _extract_text(getattr(chunk, "content", ""))
                agent_name = _identify_agent(tc_id, task_args_buffers, result_text)

                if agent_name:
                    _log_result(node, agent_name, result_text)
                    yield {
                        "event": "agent_result",
                        "data": json.dumps({
                            "agentId": agent_name,
                            "content": result_text,
                        }),
                    }

        if last_node and last_node not in _SILENT_NODES:
            _log_footer(last_node, time.time() - t_start)

        if full_response:
            session.add_assistant_message(full_response)

        _log(f"\n{'─' * 60}")
        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    return EventSourceResponse(event_generator())


@app.get("/health")
def health():
    return {"status": "ok"}
