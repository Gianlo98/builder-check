"""Langfuse observability — auto-enabled when LANGFUSE_PUBLIC_KEY + SECRET_KEY are set.

This module provides a single CallbackHandler that should be attached to every
agent invocation (both orchestrator and subagents) so the full trace tree is
visible in the Langfuse dashboard.

Usage:
    from agents.observability import get_langfuse_handler, flush_langfuse

    handler = get_langfuse_handler()
    config = {"configurable": {"thread_id": "..."}}
    if handler:
        config["callbacks"] = [handler]

    agent.stream(input_msg, config=config, ...)

    # At process shutdown:
    flush_langfuse()
"""

import atexit
import os
import logging

logger = logging.getLogger(__name__)

_handler = None
_initialized = False


def get_langfuse_handler():
    """Return a LangChain CallbackHandler for Langfuse, or None if not configured.

    The handler is created once and reused. It automatically reads
    LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, and LANGFUSE_HOST from env.
    """
    global _handler, _initialized

    if _initialized:
        return _handler

    _initialized = True

    pub = os.environ.get("LANGFUSE_PUBLIC_KEY", "")
    sec = os.environ.get("LANGFUSE_SECRET_KEY", "")

    if not pub or not sec:
        return None

    try:
        from langfuse.langchain import CallbackHandler

        # CallbackHandler auto-reads LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY,
        # and LANGFUSE_HOST from env vars.
        _handler = CallbackHandler()

        atexit.register(flush_langfuse)
        logger.info("Langfuse tracing enabled → %s", os.environ.get("LANGFUSE_HOST"))
        return _handler

    except ImportError:
        logger.warning("langfuse package not installed — tracing disabled")
        return None
    except Exception as e:
        logger.warning("Failed to initialize Langfuse: %s", e)
        return None


def flush_langfuse():
    """Flush any pending Langfuse events. Call at shutdown."""
    if _handler is not None:
        try:
            _handler.flush()
        except Exception:
            pass


def langfuse_config(thread_id: str, session_id: str | None = None, user_id: str | None = None) -> dict:
    """Build a LangGraph config dict with Langfuse callback attached.

    Provides a single function that wires thread_id (required by LangGraph)
    and Langfuse trace metadata together.
    """
    config: dict = {"configurable": {"thread_id": thread_id}}

    handler = get_langfuse_handler()
    if handler:
        trace_metadata = {}
        if session_id:
            trace_metadata["session_id"] = session_id
        if user_id:
            trace_metadata["user_id"] = user_id

        config["callbacks"] = [handler]
        config["metadata"] = trace_metadata

    return config
