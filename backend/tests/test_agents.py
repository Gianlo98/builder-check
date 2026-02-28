"""Area 2: Multi-agent loading, configuration, and dispatch.

Tests that:
- All 6 specialist agents load correctly from YAML
- Each agent has the right tools, description, and system prompt
- The orchestrator actually dispatches subagents when given full context
- Each specialist agent can be invoked independently
"""

import uuid
import pytest

from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

from agents.specialist import build_subagent_defs, get_agent_ids, get_agent_labels, load_agent_configs
from tests.conftest import invoke_agent, stream_events, tool_names_used

EXPECTED_AGENT_IDS = {"market", "competition", "customer", "business_model", "risks", "gtm"}


# ---------------------------------------------------------------------------
# Test 1: All 6 agents load from YAML
# ---------------------------------------------------------------------------

def test_all_6_agents_load():
    """build_subagent_defs() should return exactly 6 defs with correct structure."""
    defs = build_subagent_defs()

    assert len(defs) == 6, f"Expected 6 agents, got {len(defs)}"
    names = {d["name"] for d in defs}
    assert names == EXPECTED_AGENT_IDS, f"Unexpected agent names: {names}"

    for d in defs:
        assert d.get("description"), f"Agent '{d['name']}' missing description"
        assert d.get("system_prompt"), f"Agent '{d['name']}' missing system_prompt"
        assert d.get("model"), f"Agent '{d['name']}' missing model"


# ---------------------------------------------------------------------------
# Test 2: Agent IDs and labels are consistent
# ---------------------------------------------------------------------------

def test_agent_ids_and_labels_consistent():
    """get_agent_ids() and get_agent_labels() should agree on the same set of agents."""
    ids = set(get_agent_ids())
    labels = get_agent_labels()

    assert ids == EXPECTED_AGENT_IDS
    assert set(labels.keys()) == EXPECTED_AGENT_IDS
    for aid, label in labels.items():
        assert label, f"Agent '{aid}' has an empty label"


# ---------------------------------------------------------------------------
# Test 3: Each specialist has the correct tools wired up
# ---------------------------------------------------------------------------

def test_specialist_has_correct_tools():
    """Agents that declare 'web_search' in agents.yaml should have it resolved
    to a callable in their subagent def."""
    raw = load_agent_configs()
    defs = build_subagent_defs()
    defs_by_name = {d["name"]: d for d in defs}

    for agent_id, cfg in raw["agents"].items():
        declared_tools = cfg.get("tools", [])
        actual_tools = defs_by_name[agent_id]["tools"]

        assert len(actual_tools) == len(declared_tools), (
            f"Agent '{agent_id}' declared {len(declared_tools)} tools "
            f"but got {len(actual_tools)}"
        )
        # All resolved tools must be callable
        for t in actual_tools:
            assert callable(t), f"Tool in '{agent_id}' is not callable: {t}"


# ---------------------------------------------------------------------------
# Test 4: System prompts are non-trivial
# ---------------------------------------------------------------------------

def test_system_prompts_are_substantive():
    """Each specialist's system prompt should be at least 100 chars and mention
    the agent's domain."""
    defs = build_subagent_defs()
    domain_keywords = {
        "market": ["market", "tam", "growth"],
        "competition": ["compet", "competitor", "landscape"],
        "customer": ["customer", "icp", "buyer", "persona"],
        "business_model": ["revenue", "model", "pricing", "unit economics"],
        "risks": ["risk", "execution", "mitigat"],
        "gtm": ["go-to-market", "channel", "launch", "acquisition"],
    }

    for d in defs:
        prompt = d["system_prompt"].lower()
        assert len(prompt) >= 100, f"Agent '{d['name']}' system prompt is too short"
        keywords = domain_keywords.get(d["name"], [])
        assert any(kw in prompt for kw in keywords), (
            f"Agent '{d['name']}' system prompt doesn't mention its domain. "
            f"Expected one of: {keywords}"
        )


# ---------------------------------------------------------------------------
# Test 5: Orchestrator dispatches subagents when given full context
# ---------------------------------------------------------------------------

@pytest.mark.slow
def test_orchestrator_dispatches_subagents(fresh_orchestrator):
    """When given a complete startup description, the orchestrator should use
    the 'task' tool to dispatch at least one specialist subagent."""
    thread_id = f"t-{uuid.uuid4().hex[:8]}"

    full_context = (
        "I'm building a B2B SaaS platform for logistics companies to track real-time "
        "fleet emissions and carbon credits. Target customers are mid-size trucking "
        "companies with 50-200 vehicles. We charge $200/vehicle/year. "
        "We have a working prototype and 2 pilot customers. "
        "Please run a full analysis — market, competition, customer fit, business model, "
        "risks, and go-to-market strategy."
    )

    events = stream_events(fresh_orchestrator, thread_id, full_context)
    tools_used = tool_names_used(events)

    assert "task" in tools_used, (
        f"Expected 'task' tool to be called (subagent dispatch), "
        f"but only saw: {set(tools_used)}"
    )


# ---------------------------------------------------------------------------
# Test 6: Each specialist can be invoked independently
# ---------------------------------------------------------------------------

@pytest.mark.slow
@pytest.mark.parametrize("agent_id", sorted(EXPECTED_AGENT_IDS))
def test_each_subagent_invocable_directly(agent_id):
    """Each specialist definition is valid enough that it can be instantiated
    as a standalone Deep Agent and return a non-empty response."""
    import os
    from tests.conftest import _require_api_key
    _require_api_key()

    defs = build_subagent_defs()
    spec = next(d for d in defs if d["name"] == agent_id)

    agent = create_deep_agent(
        name=spec["name"],
        model=spec["model"],
        system_prompt=spec["system_prompt"],
        tools=spec["tools"],
        checkpointer=MemorySaver(),
    )

    thread_id = f"t-{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"thread_id": thread_id}}

    result = agent.invoke(
        {"messages": [{
            "role": "user",
            "content": (
                "Analyze this startup idea briefly: "
                "A mobile app that helps pet owners find emergency vets nearby. "
                "Target customers are urban pet owners aged 25-45. "
                "Revenue: $9.99/month subscription. Keep your answer concise."
            ),
        }]},
        config=config,
    )

    messages = result.get("messages", [])
    ai_response = ""
    for msg in reversed(messages):
        if hasattr(msg, "type") and msg.type == "ai" and isinstance(msg.content, str) and msg.content.strip():
            ai_response = msg.content
            break

    assert ai_response, f"Specialist '{agent_id}' returned an empty response"
    assert len(ai_response) > 50, (
        f"Specialist '{agent_id}' response is too short ({len(ai_response)} chars): {ai_response}"
    )
