"""Area 4: Result gathering, session management, and structured output.

Tests that:
- A full multi-turn conversation produces a substantive final report
- SessionManager correctly tracks messages per session
- Sessions are isolated from each other
- Specialists can return structured Pydantic output with required fields
"""

import uuid
import pytest

from pydantic import BaseModel, Field
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

from sessions.manager import SessionManager
from tests.conftest import invoke_agent, stream_events, tool_names_used


# ---------------------------------------------------------------------------
# Pydantic model for structured output tests
# ---------------------------------------------------------------------------

class AgentOutput(BaseModel):
    summary: str = Field(description="2-3 sentence executive summary of the analysis")
    score: int = Field(description="Confidence/quality score from 0 to 100")
    bullets: list[str] = Field(description="List of 3-6 key findings")
    recommendation: str = Field(description="1-2 sentence actionable recommendation")


# ---------------------------------------------------------------------------
# Test 1: Full conversation produces a substantive final report
# ---------------------------------------------------------------------------

@pytest.mark.slow
def test_full_conversation_produces_final_report(fresh_orchestrator):
    """A 2-turn conversation with complete startup context should result in
    a substantive final report mentioning multiple analysis domains."""
    thread_id = f"t-{uuid.uuid4().hex[:8]}"

    # Turn 1: complete startup description
    invoke_agent(
        fresh_orchestrator,
        thread_id,
        (
            "I'm building a SaaS platform called ShiftSync for restaurant chains to "
            "automate employee scheduling and reduce overtime costs. "
            "Target customers are restaurant chains with 10-100 locations. "
            "We charge $500/month per location. We have 3 pilot customers and $80K ARR. "
            "Main competitors are 7shifts and HotSchedules."
        ),
    )

    # Turn 2: explicitly request the full analysis
    final_response = invoke_agent(
        fresh_orchestrator,
        thread_id,
        (
            "That's all the context I have. Please now run the complete analysis — "
            "market opportunity, competitive landscape, target customer fit, business model, "
            "risk analysis, and go-to-market strategy."
        ),
    )

    assert final_response, "Expected a non-empty final report"
    assert len(final_response) > 300, (
        f"Final report is too short ({len(final_response)} chars) to be substantive"
    )

    lower = final_response.lower()

    # Should cover multiple analysis domains
    domain_signals = [
        any(w in lower for w in ["market", "tam", "addressable"]),
        any(w in lower for w in ["compet", "competitor", "rival", "7shifts"]),
        any(w in lower for w in ["customer", "icp", "restaurant"]),
        any(w in lower for w in ["revenue", "model", "arr", "pricing"]),
        any(w in lower for w in ["risk", "challenge", "threat"]),
        any(w in lower for w in ["launch", "go-to-market", "channel", "acquisition"]),
    ]
    covered = sum(domain_signals)
    assert covered >= 3, (
        f"Final report covers only {covered}/6 expected domains. Response:\n{final_response[:500]}..."
    )


# ---------------------------------------------------------------------------
# Test 2: Session stores messages with correct roles
# ---------------------------------------------------------------------------

def test_session_stores_messages():
    """SessionManager should record user and assistant messages in order."""
    mgr = SessionManager()
    session = mgr.create_session()

    session.add_user_message("Hello, I have a startup idea.")
    session.add_assistant_message("Great! Tell me more about it.")
    session.add_user_message("It's a tool for freelancers.")
    session.add_assistant_message("Who is your target customer?")

    assert len(session.messages) == 4

    assert session.messages[0] == {"role": "user", "content": "Hello, I have a startup idea."}
    assert session.messages[1] == {"role": "assistant", "content": "Great! Tell me more about it."}
    assert session.messages[2] == {"role": "user", "content": "It's a tool for freelancers."}
    assert session.messages[3] == {"role": "assistant", "content": "Who is your target customer?"}


# ---------------------------------------------------------------------------
# Test 3: Sessions are isolated from each other
# ---------------------------------------------------------------------------

def test_session_manager_isolation():
    """Two sessions should maintain completely independent message histories."""
    mgr = SessionManager()
    s1 = mgr.create_session()
    s2 = mgr.create_session()

    s1.add_user_message("Message for session 1")
    s2.add_user_message("Message for session 2")
    s2.add_user_message("Another message for session 2")

    # Session IDs must be distinct
    assert s1.session_id != s2.session_id
    assert s1.thread_id != s2.thread_id

    # Message histories are independent
    assert len(s1.messages) == 1
    assert len(s2.messages) == 2
    assert s1.messages[0]["content"] == "Message for session 1"
    assert s2.messages[0]["content"] == "Message for session 2"

    # Lookup by ID works
    assert mgr.get_session(s1.session_id) is s1
    assert mgr.get_session(s2.session_id) is s2
    assert mgr.get_session("nonexistent") is None


# ---------------------------------------------------------------------------
# Test 4: Session stores agent results
# ---------------------------------------------------------------------------

def test_session_stores_agent_results():
    """store_agent_result() should persist results keyed by agent_id."""
    mgr = SessionManager()
    session = mgr.create_session()

    market_result = {"summary": "Strong market", "score": 80, "bullets": ["TAM is large"]}
    risks_result = {"summary": "Execution risk", "score": 55, "bullets": ["Thin team"]}

    session.store_agent_result("market", market_result)
    session.store_agent_result("risks", risks_result)

    assert session.agent_results["market"] == market_result
    assert session.agent_results["risks"] == risks_result
    assert len(session.agent_results) == 2


# ---------------------------------------------------------------------------
# Test 5: Session delete works
# ---------------------------------------------------------------------------

def test_session_delete():
    """delete_session() should remove the session and return True; deleting again returns False."""
    mgr = SessionManager()
    session = mgr.create_session()
    sid = session.session_id

    assert mgr.get_session(sid) is not None
    assert mgr.delete_session(sid) is True
    assert mgr.get_session(sid) is None
    assert mgr.delete_session(sid) is False


# ---------------------------------------------------------------------------
# Test 6: Structured output from a specialist
# ---------------------------------------------------------------------------

@pytest.mark.slow
def test_structured_output_has_expected_fields():
    """A specialist invoked with response_format=AgentOutput should return
    a Pydantic object with all required fields populated."""
    from tests.conftest import _require_api_key
    _require_api_key()

    from agents.specialist import build_subagent_defs

    # Use the market specialist
    defs = build_subagent_defs()
    spec = next(d for d in defs if d["name"] == "market")

    agent = create_deep_agent(
        name=spec["name"],
        model=spec["model"],
        system_prompt=spec["system_prompt"],
        tools=spec["tools"],
        response_format=AgentOutput,
        checkpointer=MemorySaver(),
    )

    thread_id = f"t-{uuid.uuid4().hex[:8]}"
    config = {"configurable": {"thread_id": thread_id}}

    result = agent.invoke(
        {"messages": [{
            "role": "user",
            "content": (
                "Analyze the market opportunity for a mobile app that helps dog owners "
                "find pet-friendly hiking trails. Customers are urban millennials. "
                "Monetized via $4.99/month subscription."
            ),
        }]},
        config=config,
    )

    structured = result.get("structured_response")
    assert structured is not None, (
        "Expected structured_response in result but got None. "
        "Check that response_format is supported by the model."
    )
    assert isinstance(structured, AgentOutput), (
        f"Expected AgentOutput instance, got {type(structured)}"
    )

    assert structured.summary and len(structured.summary) > 20, "summary is empty or too short"
    assert 0 <= structured.score <= 100, f"score out of range: {structured.score}"
    assert len(structured.bullets) >= 2, f"Expected at least 2 bullets, got {len(structured.bullets)}"
    assert structured.recommendation and len(structured.recommendation) > 20, (
        "recommendation is empty or too short"
    )


# ---------------------------------------------------------------------------
# Test 7: Full pipeline — orchestrator -> agents -> results collected in session
# ---------------------------------------------------------------------------

@pytest.mark.slow
def test_full_pipeline_with_session(fresh_orchestrator):
    """Full end-to-end: run a conversation through the orchestrator while tracking
    messages in a session. Verifies the complete pipeline from input to stored output."""
    mgr = SessionManager()
    session = mgr.create_session()

    messages = [
        (
            "I'm building HealthTrackAI — a wearable + app combo for chronic disease patients "
            "to monitor vitals and get AI-powered health recommendations. "
            "Target: patients with diabetes or hypertension, aged 40-70. "
            "Revenue: $29/month subscription + $150 device hardware."
        ),
        "Please complete the full validation analysis now.",
    ]

    for user_msg in messages:
        session.add_user_message(user_msg)
        response = invoke_agent(fresh_orchestrator, session.thread_id, user_msg)
        assert response, f"Expected a response to: {user_msg[:60]}..."
        session.add_assistant_message(response)

    # Session should have 4 messages (2 user + 2 assistant)
    assert len(session.messages) == 4
    assert session.messages[0]["role"] == "user"
    assert session.messages[1]["role"] == "assistant"
    assert session.messages[2]["role"] == "user"
    assert session.messages[3]["role"] == "assistant"

    # Final response should be substantive
    final = session.messages[3]["content"]
    assert len(final) > 200, f"Final report too short: {len(final)} chars"
