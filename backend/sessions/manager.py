"""In-memory session manager for conversation state.

Thin wrapper so we can swap to Redis/DB later without changing call sites.
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class Session:
    session_id: str
    created_at: datetime
    thread_id: str
    messages: list[dict] = field(default_factory=list)
    agent_results: dict = field(default_factory=dict)

    def add_user_message(self, content: str):
        self.messages.append({"role": "user", "content": content})

    def add_assistant_message(self, content: str):
        self.messages.append({"role": "assistant", "content": content})

    def store_agent_result(self, agent_id: str, result: dict):
        self.agent_results[agent_id] = result


class SessionManager:
    """In-memory session store. Replace internals with Redis/DB later."""

    def __init__(self):
        self._sessions: dict[str, Session] = {}

    def create_session(self) -> Session:
        session_id = uuid.uuid4().hex[:12]
        thread_id = f"thread_{session_id}"
        session = Session(
            session_id=session_id,
            created_at=datetime.now(),
            thread_id=thread_id,
        )
        self._sessions[session_id] = session
        return session

    def get_session(self, session_id: str) -> Session | None:
        return self._sessions.get(session_id)

    def list_sessions(self) -> list[Session]:
        return list(self._sessions.values())

    def delete_session(self, session_id: str) -> bool:
        return self._sessions.pop(session_id, None) is not None
