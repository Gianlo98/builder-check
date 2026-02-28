"""Orchestrator agent — conversational Q&A that dispatches to specialist subagents."""

from pathlib import Path

import yaml
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

from agents.specialist import build_subagent_defs, get_agent_labels
from agents.tools import resolve_tools

QUESTIONS_PATH = Path(__file__).parent.parent / "config" / "questions.yaml"


def _load_questions_config() -> dict:
    with open(QUESTIONS_PATH) as f:
        return yaml.safe_load(f)


def _build_orchestrator_prompt(config: dict) -> str:
    """Combine the base orchestrator prompt with question definitions."""
    base_prompt = config["orchestrator"]["system_prompt"].strip()
    questions = config.get("questions", [])
    agent_labels = get_agent_labels()

    question_block = "\n## Questions to Cover\n\n"
    for q in questions:
        required = " (REQUIRED)" if q.get("required") else " (optional)"
        agents = q.get("triggers_agents", [])
        agent_names = ", ".join(agent_labels.get(a, a) for a in agents) if agents else "none yet"
        question_block += (
            f"- **{q['id']}**{required}: {q['prompt']}\n"
            f"  Triggers: {agent_names}\n"
        )

    agent_block = "\n## Available Specialist Agents\n\n"
    for aid, label in agent_labels.items():
        agent_block += f"- `{aid}`: {label}\n"

    agent_block += (
        "\nWhen dispatching agents, use the task tool. Provide each agent with "
        "the FULL context gathered so far. You can dispatch multiple agents in parallel.\n"
    )

    return base_prompt + question_block + agent_block


def create_orchestrator(checkpointer: MemorySaver | None = None):
    """Create the orchestrator Deep Agent with specialist subagents.

    Returns a compiled LangGraph that can be invoked or streamed.
    """
    config = _load_questions_config()
    system_prompt = _build_orchestrator_prompt(config)
    subagent_defs = build_subagent_defs()

    model = config["orchestrator"].get("model", "claude-sonnet-4-5-20250929")

    if checkpointer is None:
        checkpointer = MemorySaver()

    agent = create_deep_agent(
        name="orchestrator",
        model=model,
        system_prompt=system_prompt,
        tools=resolve_tools(["web_search"]),
        subagents=subagent_defs,
        checkpointer=checkpointer,
    )

    return agent
