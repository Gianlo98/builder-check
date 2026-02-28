import os
from typing import Literal

from tavily import TavilyClient


def _get_tavily_client() -> TavilyClient | None:
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return None
    return TavilyClient(api_key=api_key)


def web_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "general",
    include_raw_content: bool = False,
) -> str:
    """Search the web for current information on a topic.

    Use this to find real data about markets, competitors, companies,
    funding rounds, industry trends, and any other factual information.
    """
    client = _get_tavily_client()
    if client is None:
        return (
            f"[Web search unavailable — TAVILY_API_KEY not set] "
            f"Query was: {query}. Provide analysis based on your training data instead."
        )
    return client.search(
        query,
        max_results=max_results,
        include_raw_content=include_raw_content,
        topic=topic,
    )


TOOL_REGISTRY: dict[str, callable] = {
    "web_search": web_search,
}


def resolve_tools(tool_names: list[str]) -> list:
    """Resolve tool name strings from YAML config to actual tool callables."""
    tools = []
    for name in tool_names:
        if name in TOOL_REGISTRY:
            tools.append(TOOL_REGISTRY[name])
        else:
            raise ValueError(f"Unknown tool: {name!r}. Available: {list(TOOL_REGISTRY)}")
    return tools
