"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AgentsGrid } from "@/components/agents/agents-grid";
import { AgentResult, ChatMessage, AGENTS } from "@/lib/agents";
import { Loader2, Sparkles, RotateCcw, ArrowUp } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "An AI tool that helps solo founders write cold outreach emails",
  "A B2B SaaS for managing restaurant supplier relationships",
  "A marketplace connecting freelance designers with DTC brands",
];

export function ResearchInput() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"input" | "chat">("input");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingText, setStreamingText] = useState("");
  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, agentResults]);

  const createSession = async (): Promise<string> => {
    const res = await fetch("/api/session", { method: "POST" });
    if (!res.ok) throw new Error("Failed to create session");
    const data = await res.json();
    setSessionId(data.session_id);
    return data.session_id;
  };

  const sendMessage = async (text: string, sid: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreamingText("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, message: text }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
            continue;
          }
          if (line.startsWith("data: ")) {
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const data = JSON.parse(raw);
              const eventType = currentEvent || data.type || "";
              currentEvent = "";

              switch (eventType) {
                case "message": {
                  const text = data.content || "";
                  if (text && data.node === "model") {
                    accumulated += text;
                    setStreamingText(accumulated);
                  }
                  break;
                }
                case "agent_start": {
                  if (data.agentId) {
                    setAgentResults((prev) => {
                      const exists = prev.find(
                        (r) => r.agentId === data.agentId
                      );
                      if (exists) {
                        return prev.map((r) =>
                          r.agentId === data.agentId
                            ? { ...r, status: "loading" as const }
                            : r
                        );
                      }
                      return [
                        ...prev,
                        { agentId: data.agentId, status: "loading" as const },
                      ];
                    });
                  }
                  break;
                }
                case "agent_result": {
                  if (data.agentId) {
                    setAgentResults((prev) =>
                      prev.map((r) =>
                        r.agentId === data.agentId
                          ? {
                              ...r,
                              status: "done" as const,
                              content: {
                                summary: (data.content || "Analysis complete").slice(0, 200),
                                bullets: [],
                                rawContent: data.content || "",
                              },
                            }
                          : r
                      )
                    );
                  }
                  break;
                }
                case "done":
                  break;
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      if (accumulated) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulated },
        ]);
        setStreamingText("");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Something went wrong connecting to the backend. Make sure the server is running on port 8000.",
          },
        ]);
      }
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = async () => {
    const text = query.trim();
    if (!text || text.length < 3) return;
    setQuery("");

    if (phase === "input") {
      setPhase("chat");
      try {
        const sid = await createSession();
        await sendMessage(text, sid);
      } catch {
        setMessages([
          {
            role: "assistant",
            content:
              "Could not connect to the backend server. Make sure it is running:\n\ncd backend && uv run uvicorn main:app --reload --port 8000",
          },
        ]);
        setIsStreaming(false);
      }
    } else if (sessionId) {
      await sendMessage(text, sessionId);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setPhase("input");
    setQuery("");
    setSessionId(null);
    setMessages([]);
    setStreamingText("");
    setAgentResults([]);
    setIsStreaming(false);
  };

  // ── Chat phase ──────────────────────────────────────────────────────
  if (phase === "chat") {
    const hasAgents = agentResults.length > 0;

    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Startup Validation</h2>
            <p className="text-sm text-muted-foreground">
              Interactive analysis with AI orchestrator
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            New idea
          </Button>
        </div>

        {/* Chat messages */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto px-1 scroll-smooth">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Streaming assistant message */}
          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-muted whitespace-pre-wrap">
                {streamingText}
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-foreground/60 animate-pulse" />
              </div>
            </div>
          )}

          {/* Thinking indicator (no text yet) */}
          {isStreaming && !streamingText && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 bg-muted flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking…
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Agent results grid */}
        {hasAgents && <AgentsGrid results={agentResults} />}

        {/* Chat input */}
        <div className="flex gap-2 items-end">
          <Textarea
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type your response…"
            className="min-h-[48px] max-h-[120px] resize-none text-sm"
            disabled={isStreaming}
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            disabled={query.trim().length < 2 || isStreaming}
            size="icon"
            className="h-[48px] w-[48px] flex-shrink-0"
          >
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    );
  }

  // ── Input phase (initial hero) ──────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
          placeholder="Describe your startup idea or hypothesis…

e.g. &quot;A tool that helps indie game devs monetize their Discord communities&quot;"
          className="min-h-[120px] resize-none pr-4 text-base leading-relaxed"
          autoFocus
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.slice(0, 2).map((p) => (
            <button
              key={p}
              onClick={() => setQuery(p)}
              className="text-xs text-muted-foreground hover:text-foreground border border-dashed rounded-full px-3 py-1 transition-colors hover:border-foreground/30"
            >
              {p.length > 42 ? p.slice(0, 42) + "…" : p}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={query.trim().length < 3 || isStreaming}
          size="lg"
          className="flex-shrink-0 gap-2"
        >
          {isStreaming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Validate idea
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        ⌘ + Enter to submit · AI orchestrator will guide the analysis
      </p>
    </div>
  );
}
