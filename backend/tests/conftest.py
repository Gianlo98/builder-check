"""Shared fixtures and configuration for the test suite.

All tests use real LLM calls (Anthropic API). Ensure ANTHROPIC_API_KEY is set
in the .env file at the project root before running.

Usage:
    uv run pytest tests/ -v                  # all tests
    uv run pytest tests/ -v -m "not slow"    # skip multi-turn / full-dispatch tests
    uv run pytest tests/test_tools.py -v     # single file
"""

import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from langgraph.checkpoint.memory import MemorySaver

# Load .env from project root (one level above backend/)
load_dotenv(Path(__file__).parent.parent.parent / ".env")


def pytest_configure(config):
    config.addinivalue_line("markers", "slow: marks tests as slow (multi-turn LLM calls)")


def _require_api_key():
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key or key == "your-api-key-here":
        pytest.skip("ANTHROPIC_API_KEY not set — skipping LLM test")


# ---------------------------------------------------------------------------
# Orchestrator fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def orchestrator():
    """A single orchestrator instance reused across tests in the same module."""
    _require_api_key()
    from agents.orchestrator import create_orchestrator
    return create_orchestrator(checkpointer=MemorySaver())


@pytest.fixture
def fresh_orchestrator():
    """A new orchestrator with a fresh checkpointer for tests that need isolation."""
    _require_api_key()
    from agents.orchestrator import create_orchestrator
    return create_orchestrator(checkpointer=MemorySaver())


# ---------------------------------------------------------------------------
# Session fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def session_manager():
    from sessions.manager import SessionManager
    return SessionManager()


@pytest.fixture
def session(session_manager):
    return session_manager.create_session()


# ---------------------------------------------------------------------------
# Helpers available to all tests
# ---------------------------------------------------------------------------

def _extract_text(content) -> str:
    """Extract plain text from a message content field.

    Anthropic streaming returns content as a list of typed blocks
    e.g. [{'type': 'text', 'text': 'Hi', 'index': 0}] rather than a plain str.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(
            block.get("text", "")
            for block in content
            if isinstance(block, dict) and block.get("type") == "text"
        )
    return ""


def invoke_agent(agent, thread_id: str, message: str) -> str:
    """Invoke an agent and return the final AI text response."""
    config = {"configurable": {"thread_id": thread_id}}
    result = agent.invoke(
        {"messages": [{"role": "user", "content": message}]},
        config=config,
    )
    messages = result.get("messages", [])
    for msg in reversed(messages):
        if hasattr(msg, "type") and msg.type == "ai":
            text = _extract_text(msg.content)
            if text.strip():
                return text
    return ""


def _unwrap_messages(raw) -> list:
    """LangGraph 1.0+ wraps state updates in an Overwrite object; unwrap it."""
    if hasattr(raw, "value"):
        raw = raw.value
    return raw if isinstance(raw, list) else []


def stream_events(agent, thread_id: str, message: str) -> list[dict]:
    """Stream agent events and return a flat list of all event dicts."""
    config = {"configurable": {"thread_id": thread_id}}
    events = []
    for event in agent.stream(
        {"messages": [{"role": "user", "content": message}]},
        config=config,
        stream_mode="updates",
    ):
        events.append(event)
    return events


def tool_names_used(events: list[dict]) -> list[str]:
    """Extract the names of all tools called across a stream of events."""
    names = []
    for event in events:
        for node_data in event.values():
            if not node_data:
                continue
            for msg in _unwrap_messages(node_data.get("messages", [])):
                if hasattr(msg, "type") and msg.type == "tool" and hasattr(msg, "name"):
                    names.append(msg.name)
    return names
