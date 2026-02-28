"use client";

import { useRef, useCallback } from "react";
import { AgentResult, AGENTS, AgentConfig } from "@/lib/agents";
import { Separator } from "@/components/ui/separator";
import { DashboardHeader } from "./dashboard-header";
import { OverallScoreCard } from "./overall-score-card";
import { ScoreOverviewGrid } from "./score-overview-grid";
import { AgentCard } from "@/components/agents/agent-card";
import { AgentSkeleton } from "@/components/agents/agent-skeleton";

interface ValidationDashboardProps {
  query: string;
  results: AgentResult[];
}

export function ValidationDashboard({
  query,
  results,
}: ValidationDashboardProps) {
  const agentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToAgent = useCallback((agentId: string) => {
    agentRefs.current[agentId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, []);

  const getResult = (agentId: string) =>
    results.find((r) => r.agentId === agentId);

  return (
    <div className="w-full space-y-8">
      <DashboardHeader query={query} />

      <Separator />

      {/* Score Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <OverallScoreCard results={results} />
        <ScoreOverviewGrid results={results} onAgentClick={scrollToAgent} />
      </div>

      <Separator />

      {/* Detailed Agent Analysis */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Detailed Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {AGENTS.map((agent: AgentConfig, idx: number) => {
            const result = getResult(agent.id);
            const status = result?.status ?? "idle";

            return (
              <div
                key={agent.id}
                ref={(el) => {
                  agentRefs.current[agent.id] = el;
                }}
              >
                {status === "done" && result?.content ? (
                  <AgentCard agent={agent} content={result.content} />
                ) : (
                  <div
                    className="fade-in-up"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <AgentSkeleton agent={agent} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
