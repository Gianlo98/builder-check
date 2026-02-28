"""Area 1: Orchestrator conversational Q&A flow.

Tests that the orchestrator:
- Asks clarifying questions rather than immediately producing a report
- Adapts follow-ups based on what the user already said
- Maintains conversation history across multiple turns
"""

import uuid
import pytest

from tests.conftest import invoke_agent, stream_events


# ---------------------------------------------------------------------------
# Test 1: Orchestrator asks a question on the first turn
# ---------------------------------------------------------------------------

def test_orchestrator_asks_first_question(fresh_orchestrator):
    """A vague opener should prompt the orchestrator to ask a follow-up question,
    not immediately produce a full analysis report."""
    thread_id = f"t-{uuid.uuid4().hex[:8]}"
    response = invoke_agent(
        fresh_orchestrator,
        thread_id,
        "Hi, I have a startup idea I'd like to validate.",
    )

    assert response, "Expected a non-empty response"

    # The response should end with or contain a question mark — the agent is asking
    # for more information, not delivering a final report.
    assert "?" in response, (
        f"Expected the orchestrator to ask a follow-up question, but got:\n{response}"
    )

    # It should NOT immediately produce a score or a structured report
    lower = response.lower()
    assert "score" not in lower or "?" in response, (
        "Orchestrator jumped straight to scoring without gathering info"
    )


# ---------------------------------------------------------------------------
# Test 2: Follow-up references previously provided information
# ---------------------------------------------------------------------------

@pytest.mark.slow
def test_orchestrator_follows_up(fresh_orchestrator):
    """After a 2-turn exchange the orchestrator's second reply should reference
    the customer information provided in the first turn."""
    thread_id = f"t-{uuid.uuid4().hex[:8]}"

    invoke_agent(
        fresh_orchestrator,
        thread_id,
        "I'm building a tool that helps freelance designers manage client invoices automatically.",
    )

    response2 = invoke_agent(
        fresh_orchestrator,
        thread_id,
        "My target customer is freelance graphic designers, aged 25-40, who hate doing admin work.",
    )

    assert response2, "Expected a non-empty second response"
    lower = response2.lower()
    # The response should reference the customer segment provided
    assert any(word in lower for word in ["freelance", "designer", "graphic", "admin"]), (
        f"Second response does not reference the customer info provided:\n{response2}"
    )


# ---------------------------------------------------------------------------
# Test 3: Orchestrator skips questions already answered
# ---------------------------------------------------------------------------

def test_orchestrator_skips_answered_questions(fresh_orchestrator):
    """When the user's first message already answers multiple questions,
    the orchestrator should not re-ask those same questions."""
    thread_id = f"t-{uuid.uuid4().hex[:8]}"

    # This message directly answers: idea, target customer, and revenue model
    rich_opener = (
        "I'm building a SaaS tool for small restaurant owners to manage staff scheduling. "
        "My target customers are independent restaurants with 5-20 employees. "
        "I plan to charge $49/month per location on a subscription basis."
    )
    response = invoke_agent(fresh_orchestrator, thread_id, rich_opener)

    assert response, "Expected a non-empty response"
    lower = response.lower()

    # The orchestrator should NOT ask about target customer or revenue model again
    # since we already provided both
    re_ask_phrases = [
        "who is your target customer",
        "how do you plan to make money",
        "what is your revenue model",
        "who are you building this for",
    ]
    for phrase in re_ask_phrases:
        assert phrase not in lower, (
            f"Orchestrator re-asked a question that was already answered: '{phrase}'\n"
            f"Response:\n{response}"
        )


# ---------------------------------------------------------------------------
# Test 4: Conversation history is maintained across turns
# ---------------------------------------------------------------------------

@pytest.mark.slow
def test_orchestrator_maintains_conversation_history(fresh_orchestrator):
    """Across 3 turns in the same thread, later responses should demonstrate
    awareness of earlier turns (MemorySaver / thread_id working correctly)."""
    thread_id = f"t-{uuid.uuid4().hex[:8]}"

    # Turn 1: introduce a very specific, unusual startup name
    invoke_agent(
        fresh_orchestrator,
        thread_id,
        "I'm building a startup called ZorbixPrime — it's an AI tool for beekeepers.",
    )

    # Turn 2: add customer info
    invoke_agent(
        fresh_orchestrator,
        thread_id,
        "My customers are commercial beekeepers with more than 50 hives.",
    )

    # Turn 3: ask a follow-up — the agent should remember the startup name
    response3 = invoke_agent(
        fresh_orchestrator,
        thread_id,
        "What do you think are the biggest risks for this kind of business?",
    )

    assert response3, "Expected a non-empty third response"
    # The agent should reference the context (beekeeper domain) in its risk analysis
    lower = response3.lower()
    assert any(word in lower for word in ["beekeeper", "hive", "agricultural", "niche", "zorbix"]), (
        f"Turn 3 response doesn't reference earlier conversation context:\n{response3}"
    )
