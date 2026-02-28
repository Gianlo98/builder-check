"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AgentResult, AGENTS } from "@/lib/agents";
import { ValidationDashboard } from "@/components/dashboard/validation-dashboard";

export function ReportContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 5) {
      router.replace("/");
      return;
    }

    // Prevent double-fire in strict mode
    if (hasStarted.current) return;
    hasStarted.current = true;

    const controller = new AbortController();
    abortRef.current = controller;

    setAgentResults(
      AGENTS.map((a) => ({ agentId: a.id, status: "loading" as const }))
    );

    (async () => {
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
                break;
              }

              if (event.agentId) {
                setAgentResults((prev) => {
                  const next = [...prev];
                  const idx = next.findIndex(
                    (r) => r.agentId === event.agentId
                  );
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
      }
    })();

    return () => {
      controller.abort();
    };
  }, [query, router]);

  if (!query.trim()) return null;

  return (
    <main className="relative min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <ValidationDashboard query={query} results={agentResults} />
      </div>
    </main>
  );
}
