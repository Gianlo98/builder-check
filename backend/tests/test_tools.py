"""Area 3: Tool functionality — file I/O, web search, tool registry.

Tests that:
- Deep Agents built-in file tools (write_file, read_file, ls) work correctly
- web_search() returns usable results or a clean fallback when key is absent
- The tool registry validates names and resolves callables correctly
"""

import os
import uuid
import pytest

from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_tool_agent(tools=None):
    """Create a minimal Deep Agent for tool testing."""
    from tests.conftest import _require_api_key
    _require_api_key()
    return create_deep_agent(
        model="claude-sonnet-4-5-20250929",
        system_prompt=(
            "You are a helpful assistant. Follow the user's instructions exactly. "
            "When asked to use file tools, use them directly. "
            "When asked to search the web, use the web_search tool. "
            "Be concise — don't explain what you're doing, just do it."
        ),
        tools=tools or [],
        checkpointer=MemorySaver(),
    )


def _get_ai_response(result: dict) -> str:
    for msg in reversed(result.get("messages", [])):
        if hasattr(msg, "type") and msg.type == "ai" and isinstance(msg.content, str) and msg.content.strip():
            return msg.content
    return ""


def _get_tool_calls(result: dict) -> list[str]:
    """Return list of tool names called during invocation."""
    names = []
    for msg in result.get("messages", []):
        if hasattr(msg, "type") and msg.type == "tool" and hasattr(msg, "name"):
            names.append(msg.name)
    return names


# ---------------------------------------------------------------------------
# File I/O Tests
# ---------------------------------------------------------------------------

@pytest.mark.slow
def test_agent_can_write_and_read_file():
    """Agent should be able to write a file using write_file and then read it back."""
    agent = _make_tool_agent()
    thread_id = f"t-{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"thread_id": thread_id}}

    secret_value = f"hello-{uuid.uuid4().hex[:6]}"

    result = agent.invoke(
        {"messages": [{
            "role": "user",
            "content": (
                f"Please write the text '{secret_value}' to a file called /tmp/test_note.txt, "
                f"then read it back and tell me exactly what the file contains."
            ),
        }]},
        config=config,
    )

    response = _get_ai_response(result)
    tools_called = _get_tool_calls(result)

    # Both write and read tools should have been used
    assert "write_file" in tools_called, (
        f"Expected write_file to be called. Tools used: {tools_called}"
    )
    assert "read_file" in tools_called, (
        f"Expected read_file to be called. Tools used: {tools_called}"
    )

    # The response should mention the exact value we wrote
    assert secret_value in response, (
        f"Agent read back wrong content. Expected '{secret_value}' in:\n{response}"
    )


@pytest.mark.slow
def test_agent_can_list_files():
    """Agent should be able to create files and list them with ls."""
    agent = _make_tool_agent()
    thread_id = f"t-{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"thread_id": thread_id}}

    result = agent.invoke(
        {"messages": [{
            "role": "user",
            "content": (
                "Please write 'content A' to /tmp/file_alpha.txt and 'content B' to /tmp/file_beta.txt. "
                "Then run ls on /tmp and tell me which files you see there."
            ),
        }]},
        config=config,
    )

    response = _get_ai_response(result)
    tools_called = _get_tool_calls(result)

    assert "write_file" in tools_called, f"write_file not called. Tools: {tools_called}"
    assert "ls" in tools_called, f"ls not called. Tools: {tools_called}"

    lower = response.lower()
    assert "alpha" in lower or "file_alpha" in lower, (
        f"Expected file_alpha.txt in ls output. Response:\n{response}"
    )
    assert "beta" in lower or "file_beta" in lower, (
        f"Expected file_beta.txt in ls output. Response:\n{response}"
    )


@pytest.mark.slow
def test_agent_can_edit_file():
    """Agent should be able to write a file and then edit it."""
    agent = _make_tool_agent()
    thread_id = f"t-{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"thread_id": thread_id}}

    result = agent.invoke(
        {"messages": [{
            "role": "user",
            "content": (
                "Write 'original content' to /tmp/editable.txt. "
                "Then edit that file to replace 'original' with 'updated'. "
                "Finally, read the file and confirm what it now says."
            ),
        }]},
        config=config,
    )

    response = _get_ai_response(result)
    tools_called = _get_tool_calls(result)

    assert "write_file" in tools_called, f"write_file not called. Tools: {tools_called}"
    # edit_file or a second write_file is acceptable
    assert "edit_file" in tools_called or tools_called.count("write_file") >= 2, (
        f"Expected edit_file or a second write. Tools: {tools_called}"
    )
    assert "updated" in response.lower(), (
        f"Expected 'updated' in final response:\n{response}"
    )


# ---------------------------------------------------------------------------
# Web Search Tests
# ---------------------------------------------------------------------------

def test_web_search_returns_string_no_key():
    """web_search() should return a non-empty string even when no Tavily key is set."""
    # Temporarily remove the key if present
    original = os.environ.pop("TAVILY_API_KEY", None)
    try:
        from agents.tools import web_search
        result = web_search("test query")
        assert isinstance(result, str), "web_search should always return a string"
        assert len(result) > 0, "web_search should return a non-empty string"
    finally:
        if original:
            os.environ["TAVILY_API_KEY"] = original


def test_web_search_fallback_message():
    """When TAVILY_API_KEY is absent, the fallback message should explain this clearly."""
    original = os.environ.pop("TAVILY_API_KEY", None)
    try:
        from agents.tools import web_search
        result = web_search("recent AI startup funding")
        assert "unavailable" in result.lower() or "not set" in result.lower(), (
            f"Expected a fallback message when no Tavily key. Got: {result}"
        )
        # Should not raise, should include the query in the fallback
        assert "recent AI startup funding" in result
    finally:
        if original:
            os.environ["TAVILY_API_KEY"] = original


@pytest.mark.slow
def test_agent_uses_web_search():
    """A specialist agent given a research prompt should call web_search in its stream."""
    from tests.conftest import _require_api_key
    _require_api_key()

    from agents.tools import web_search
    agent = _make_tool_agent(tools=[web_search])
    thread_id = f"t-{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"thread_id": thread_id}}

    result = agent.invoke(
        {"messages": [{
            "role": "user",
            "content": (
                "Use web_search to find the current top 3 AI coding tools in 2026. "
                "List their names."
            ),
        }]},
        config=config,
    )

    tools_called = _get_tool_calls(result)
    response = _get_ai_response(result)

    assert "web_search" in tools_called, (
        f"Expected web_search to be called. Tools used: {tools_called}"
    )
    assert response, "Expected a non-empty response after web search"


# ---------------------------------------------------------------------------
# Tool Registry Tests
# ---------------------------------------------------------------------------

def test_unknown_tool_raises():
    """resolve_tools() should raise ValueError for an unrecognised tool name."""
    from agents.tools import resolve_tools
    with pytest.raises(ValueError, match="Unknown tool"):
        resolve_tools(["nonexistent_tool_xyz"])


def test_known_tools_resolve():
    """resolve_tools(['web_search']) should return a list with one callable."""
    from agents.tools import resolve_tools
    tools = resolve_tools(["web_search"])
    assert len(tools) == 1
    assert callable(tools[0])


def test_empty_tool_list_resolves():
    """resolve_tools([]) should return an empty list without error."""
    from agents.tools import resolve_tools
    assert resolve_tools([]) == []


def test_multiple_known_tools_resolve():
    """resolve_tools with a repeated known tool should resolve each occurrence."""
    from agents.tools import resolve_tools
    # web_search is the only registered tool; resolving it twice should give 2 callables
    tools = resolve_tools(["web_search", "web_search"])
    assert len(tools) == 2
    assert all(callable(t) for t in tools)
