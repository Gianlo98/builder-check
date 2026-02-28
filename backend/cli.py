#!/usr/bin/env python3
"""Interactive CLI for testing the orchestrator agent in the terminal.

Usage:
    uv run python cli.py             # normal mode (clean output)
    uv run python cli.py --debug     # debug mode (full agent trace)
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

if not os.environ.get("ANTHROPIC_API_KEY") or os.environ["ANTHROPIC_API_KEY"] == "your-api-key-here":
    print("ERROR: Set your ANTHROPIC_API_KEY in .env before running.")
    print(f"  File: {env_path}")
    sys.exit(1)

from agents.orchestrator import create_orchestrator
from agents.observability import get_langfuse_handler, flush_langfuse, langfuse_config
from agents.specialist import get_agent_labels
from sessions.manager import SessionManager

# ---------------------------------------------------------------------------
# ANSI colors
# ---------------------------------------------------------------------------

class C:
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    DIM     = "\033[2m"
    ITALIC  = "\033[3m"
    RED     = "\033[31m"
    GREEN   = "\033[32m"
    YELLOW  = "\033[33m"
    BLUE    = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN    = "\033[36m"
    WHITE   = "\033[37m"
    BG_BLACK = "\033[40m"

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

AGENT_LABELS = get_agent_labels()

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


# ---------------------------------------------------------------------------
# Debug formatter helpers
# ---------------------------------------------------------------------------

_at_line_start = True

def _reset_line_state():
    global _at_line_start
    _at_line_start = True

def print_separator():
    print("\n" + "─" * 70 + "\n")

def _dbg_header(node: str, extra: str = ""):
    color = _color_for(node)
    label = _label_for(node)
    tag = f" {extra}" if extra else ""
    bar = "─" * max(1, 50 - len(label) - len(tag))
    print(f"\n{color}{C.BOLD}┌─ {label}{tag} {bar}{C.RESET}")
    _reset_line_state()

def _dbg_line(node: str, text: str):
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

def _dbg_info(node: str, label: str, value: str):
    """Print a key: value info line inside the box."""
    color = _color_for(node)
    print(f"{color}│ {C.BOLD}{label}:{C.RESET} {value}")

def _dbg_info_block(node: str, label: str, value: str, max_lines: int = 8):
    """Print a multi-line block (like a prompt) indented inside the box."""
    color = _color_for(node)
    print(f"{color}│ {C.BOLD}{label}:{C.RESET}")
    lines = value.split("\n")
    for i, line in enumerate(lines[:max_lines]):
        print(f"{color}│   {C.DIM}{line}{C.RESET}")
    if len(lines) > max_lines:
        print(f"{color}│   {C.DIM}...({len(lines) - max_lines} more lines){C.RESET}")

def _dbg_divider(node: str, label: str = ""):
    color = _color_for(node)
    if label:
        bar = "─" * max(1, 48 - len(label))
        print(f"{color}├─ {label} {bar}{C.RESET}")
    else:
        print(f"{color}├{'─' * 52}{C.RESET}")
    _reset_line_state()

def _dbg_footer(node: str):
    color = _color_for(node)
    print(f"\n{color}{C.BOLD}└{'─' * 52}{C.RESET}")
    _reset_line_state()


# ---------------------------------------------------------------------------
# Streaming: debug mode
# ---------------------------------------------------------------------------

def stream_debug(agent, session, user_input: str) -> str:
    config = langfuse_config(thread_id=session.thread_id, session_id=session.session_id)
    input_msg = {"messages": [{"role": "user", "content": user_input}]}

    full_response = ""
    last_node = None

    # Track task tool calls: accumulate JSON args per tool_call id
    # so we can parse which specialist and what prompt when complete.
    task_args_buffers: dict[str, str] = {}   # tool_call_id -> accumulated JSON
    task_dispatched: set[str] = set()        # tool_call_ids already printed
    current_tc_id: str | None = None

    # Track results per tool_call_id
    task_result_count = 0

    t_start = time.time()

    for chunk, metadata in agent.stream(input_msg, config=config, stream_mode="messages"):
        node = metadata.get("langgraph_node", "")
        chunk_type = getattr(chunk, "type", "")

        # --- Node transitions ---
        if node != last_node and node not in _SILENT_NODES:
            if last_node and last_node not in _SILENT_NODES:
                elapsed = time.time() - t_start
                _dbg_footer(last_node)
                print(f"{C.DIM}  ({elapsed:.1f}s elapsed){C.RESET}")
            _dbg_header(node)
            task_result_count = 0
            last_node = node

        # --- AI message chunks ---
        if chunk_type in ("AIMessageChunk", "ai"):
            # 1) Streamed text
            text = _extract_text(chunk.content)
            if text:
                _dbg_line(node, text)
                if node == "model":
                    full_response += text

            # 2) Tool call starts (has name + id)
            tc = getattr(chunk, "tool_calls", None)
            if tc:
                for call in tc:
                    name = call.get("name", "")
                    tc_id = call.get("id", "")
                    if name and tc_id:
                        current_tc_id = tc_id
                        task_args_buffers[tc_id] = ""

            # 3) Tool call arg streaming (accumulate JSON)
            tc_chunks = getattr(chunk, "tool_call_chunks", None)
            if tc_chunks:
                for tcc in tc_chunks:
                    tc_id = tcc.get("id") or current_tc_id
                    frag = tcc.get("args", "")
                    if tc_id and frag:
                        task_args_buffers.setdefault(tc_id, "")
                        task_args_buffers[tc_id] += frag

                    # Try to parse completed JSON and display the dispatch
                    if tc_id and tc_id not in task_dispatched:
                        raw = task_args_buffers.get(tc_id, "")
                        try:
                            args = json.loads(raw)
                            task_dispatched.add(tc_id)
                            _print_task_dispatch(node, args)
                        except (json.JSONDecodeError, ValueError):
                            pass

        # --- Tool results ---
        if chunk_type in ("tool", "ToolMessage"):
            tool_name = getattr(chunk, "name", "?")
            tc_id = getattr(chunk, "tool_call_id", "")
            result_text = _extract_text(getattr(chunk, "content", ""))
            task_result_count += 1

            # Try to figure out which specialist this result belongs to
            agent_name = _identify_agent_from_result(tc_id, task_args_buffers, result_text)
            _print_task_result(node, tool_name, agent_name, result_text, task_result_count)

    if last_node and last_node not in _SILENT_NODES:
        elapsed = time.time() - t_start
        _dbg_footer(last_node)
        print(f"{C.DIM}  ({elapsed:.1f}s total){C.RESET}")

    return full_response


def _print_task_dispatch(node: str, args: dict):
    """Print a nicely formatted task dispatch showing which agent + input."""
    color = _color_for(node)
    subagent = args.get("subagent_type", "?")
    description = args.get("description", "")
    agent_color = _color_for(subagent)
    label = AGENT_LABELS.get(subagent, subagent)

    print(f"\n{color}│")
    print(f"{color}│ {C.BOLD}>> DISPATCH: {agent_color}{label} ({subagent}){C.RESET}")

    if description:
        # Show the prompt sent to the specialist (truncated)
        lines = description.strip().split("\n")
        print(f"{color}│ {C.DIM}   Input:{C.RESET}")
        for line in lines[:6]:
            print(f"{color}│ {C.DIM}     {line[:100]}{C.RESET}")
        if len(lines) > 6:
            print(f"{color}│ {C.DIM}     ...({len(lines)-6} more lines){C.RESET}")


def _identify_agent_from_result(tc_id: str, buffers: dict, result_text: str) -> str:
    """Try to identify which specialist produced this result."""
    # First try: parse the args buffer for this tool_call_id
    if tc_id and tc_id in buffers:
        try:
            args = json.loads(buffers[tc_id])
            return args.get("subagent_type", "")
        except (json.JSONDecodeError, ValueError):
            pass

    # Fallback: scan result text for domain keywords
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


def _print_task_result(node: str, tool_name: str, agent_name: str, result_text: str, index: int):
    """Print a task result with agent identification and content preview."""
    color = _color_for(node)
    if agent_name:
        agent_color = _color_for(agent_name)
        label = AGENT_LABELS.get(agent_name, agent_name)
        tag = f"{agent_color}{C.BOLD}{label}{C.RESET}"
    else:
        tag = f"{C.DIM}agent #{index}{C.RESET}"

    print(f"\n{color}│")
    print(f"{color}│ {C.GREEN}{C.BOLD}<< RESULT from {tag}{C.GREEN}{C.BOLD}:{C.RESET}")

    # Show the first ~6 meaningful lines of the result
    lines = result_text.strip().split("\n")
    meaningful = [l for l in lines if l.strip()][:6]
    for line in meaningful:
        truncated = line[:100] + ("..." if len(line) > 100 else "")
        print(f"{color}│ {C.DIM}   {truncated}{C.RESET}")
    remaining = len([l for l in lines if l.strip()]) - 6
    if remaining > 0:
        print(f"{color}│ {C.DIM}   ...({remaining} more lines){C.RESET}")
    print(f"{color}│")


# ---------------------------------------------------------------------------
# Streaming: normal mode (unchanged)
# ---------------------------------------------------------------------------

def stream_normal(agent, session, user_input: str) -> str:
    config = langfuse_config(thread_id=session.thread_id, session_id=session.session_id)
    input_msg = {"messages": [{"role": "user", "content": user_input}]}

    full_response = ""
    last_node = None

    for chunk, metadata in agent.stream(input_msg, config=config, stream_mode="messages"):
        node = metadata.get("langgraph_node", "")
        chunk_type = getattr(chunk, "type", "")

        if node != last_node and node not in _SILENT_NODES:
            if full_response:
                print(f"\n  {C.DIM}[{node}]{C.RESET}", end="", flush=True)
            last_node = node

        if chunk_type in ("AIMessageChunk", "ai"):
            text = _extract_text(chunk.content)
            if text:
                if not full_response:
                    print("\nAnalyst: ", end="", flush=True)
                print(text, end="", flush=True)
                full_response += text

    if full_response:
        print()
    return full_response


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Venture Validator CLI")
    parser.add_argument("--debug", action="store_true",
                        help="Show full agent trace: dispatches, inputs, outputs, timing")
    args = parser.parse_args()

    debug = args.debug
    stream_fn = stream_debug if debug else stream_normal

    print("=" * 70)
    print("  Venture Validator — Multi-Agent Startup Analyzer")
    if debug:
        print(f"  {C.YELLOW}{C.BOLD}DEBUG MODE{C.RESET} — showing agent dispatches, I/O, timing")
    print("=" * 70)
    print()
    print("Type your startup idea or answer the analyst's questions.")
    print("Commands:  /new = new session  |  /quit = exit  |  /debug = toggle")
    print()

    handler = get_langfuse_handler()
    if handler:
        print(f"  Langfuse: {C.GREEN}ON{C.RESET} → {os.environ.get('LANGFUSE_HOST', 'https://cloud.langfuse.com')}")
    else:
        print(f"  Langfuse: {C.DIM}OFF{C.RESET}")
    print()

    session_mgr = SessionManager()
    session = session_mgr.create_session()
    agent = create_orchestrator()

    print(f"Session: {session.session_id}")
    print_separator()

    try:
        while True:
            try:
                user_input = input("You: ").strip()
            except (EOFError, KeyboardInterrupt):
                print("\n\nGoodbye!")
                break

            if not user_input:
                continue

            if user_input.lower() == "/quit":
                print("Goodbye!")
                break

            if user_input.lower() == "/debug":
                debug = not debug
                stream_fn = stream_debug if debug else stream_normal
                state = f"{C.YELLOW}{C.BOLD}ON{C.RESET}" if debug else f"{C.DIM}OFF{C.RESET}"
                print(f"  Debug mode: {state}")
                continue

            if user_input.lower() == "/new":
                session = session_mgr.create_session()
                agent = create_orchestrator()
                print(f"\nNew session: {session.session_id}")
                print_separator()
                continue

            session.add_user_message(user_input)

            response = stream_fn(agent, session, user_input)
            if response:
                session.add_assistant_message(response)
            print_separator()
    finally:
        flush_langfuse()


if __name__ == "__main__":
    main()
