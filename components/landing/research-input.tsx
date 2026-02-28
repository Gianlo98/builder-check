"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AgentsGrid } from "@/components/agents/agents-grid";
import { AgentResult, AGENTS } from "@/lib/agents";
import { Loader2, Sparkles, RotateCcw } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "An AI tool that helps solo founders write cold outreach emails",
  "A B2B SaaS for managing restaurant supplier relationships",
  "A marketplace connecting freelance designers with DTC brands",
];

export function ResearchInput() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"input" | "analyzing">("input");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = async () => {
    if (!query.trim() || query.trim().length < 5) return;

    // Cancel any in-flight stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSubmittedQuery(query.trim());
    setPhase("analyzing");
    setIsStreaming(true);
    // Start all agents in "loading" state
    setAgentResults(
      AGENTS.map((a) => ({ agentId: a.id, status: "loading" as const }))
    );

    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const event = JSON.parse(raw);

            if (event.type === "done") {
              setIsStreaming(false);
              break;
            }

            if (event.agentId) {
              setAgentResults((prev) => {
                const next = [...prev];
                const idx = next.findIndex((r) => r.agentId === event.agentId);
                if (idx >= 0) {
                  next[idx] = {
                    agentId: event.agentId,
                    status: event.status,
                    content: event.content,
                  };
                }
                return next;
              });
            }
          } catch {
            // Ignore parse errors in the stream
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setAgentResults((prev) =>
          prev.map((r) =>
            r.status === "loading"
              ? { ...r, status: "error", error: "Analysis failed" }
              : r
          )
        );
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setPhase("input");
    setQuery("");
    setSubmittedQuery("");
    setAgentResults([]);
    setIsStreaming(false);
  };

  if (phase === "analyzing") {
    return (
      <div className="fixed inset-0 bg-background overflow-y-auto z-50">
        <div className="min-h-full px-6 py-8 space-y-8 max-w-screen-2xl mx-auto">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 sticky top-0 bg-background/90 backdrop-blur-sm py-3 -mx-6 px-6 border-b z-10">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Validating idea</p>
              <p className="text-sm font-medium truncate">&ldquo;{submittedQuery}&rdquo;</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex-shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              New idea
            </Button>
          </div>

          <AgentsGrid results={agentResults} />
        </div>
      </div>
    );
  }

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
        {/* Example prompts */}
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
          disabled={query.trim().length < 5 || isStreaming}
          size="lg"
          className="flex-shrink-0 gap-2"
        >
          {isStreaming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
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
        ⌘ + Enter to submit · 6 AI agents will run in parallel
      </p>
    </div>
  );
}
