"""FastAPI server — thin API layer for future frontend integration.

Run with: uvicorn main:app --reload --port 8000
"""

import json
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from agents.orchestrator import create_orchestrator
from agents.observability import get_langfuse_handler, flush_langfuse, langfuse_config
from sessions.manager import SessionManager

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

session_mgr = SessionManager()
_orchestrator = None


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


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _orchestrator
    _orchestrator = create_orchestrator()
    get_langfuse_handler()
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
    """Stream orchestrator responses as Server-Sent Events."""
    session = session_mgr.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.add_user_message(req.message)

    async def event_generator():
        config = langfuse_config(
            thread_id=session.thread_id,
            session_id=session.session_id,
        )
        input_msg = {"messages": [{"role": "user", "content": req.message}]}

        for chunk, metadata in _orchestrator.stream(input_msg, config=config, stream_mode="messages"):
            node = metadata.get("langgraph_node", "")
            chunk_type = getattr(chunk, "type", "")

            if chunk_type in ("AIMessageChunk", "ai"):
                text = _extract_text(chunk.content)
                if text:
                    yield {
                        "event": "message",
                        "data": json.dumps({"content": text, "node": node}),
                    }

            if chunk_type == "tool" and hasattr(chunk, "name"):
                yield {
                    "event": "tool_call",
                    "data": json.dumps({"tool": chunk.name, "node": node}),
                }

        yield {"event": "done", "data": json.dumps({"status": "complete"})}

    return EventSourceResponse(event_generator())


@app.get("/health")
def health():
    return {"status": "ok"}
