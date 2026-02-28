"""Factory for creating specialist subagent definitions from YAML config."""

from pathlib import Path

import yaml

from agents.tools import resolve_tools

CONFIG_PATH = Path(__file__).parent.parent / "config" / "agents.yaml"


def load_agent_configs() -> dict:
    """Load all agent configurations from agents.yaml."""
    with open(CONFIG_PATH) as f:
        return yaml.safe_load(f)


def build_subagent_defs() -> list[dict]:
    """Build Deep Agents subagent definition dicts from YAML config.

    Returns a list of dicts suitable for passing to
    create_deep_agent(subagents=[...]).
    """
    raw = load_agent_configs()
    default_model = raw.get("defaults", {}).get("model", "claude-haiku-4-5-20251001")
    agents = raw.get("agents", {})

    subagent_defs = []
    for agent_id, cfg in agents.items():
        tool_names = cfg.get("tools", [])
        tools = resolve_tools(tool_names)

        subagent_defs.append({
            "name": agent_id,
            "description": cfg["description"],
            "system_prompt": cfg["system_prompt"].strip(),
            "tools": tools,
            "model": cfg.get("model") or default_model,
        })

    return subagent_defs


def get_agent_ids() -> list[str]:
    """Return the list of specialist agent IDs from config."""
    raw = load_agent_configs()
    return list(raw.get("agents", {}).keys())


def get_agent_labels() -> dict[str, str]:
    """Return a mapping of agent_id -> human-readable label."""
    raw = load_agent_configs()
    return {
        aid: cfg["label"]
        for aid, cfg in raw.get("agents", {}).items()
    }
