"use client";

import { useState } from "react";
import { AgentResult, AgentConfig, AgentContent, AGENTS } from "@/lib/agents";
import { AgentSkeleton } from "./agent-skeleton";
import { CompactAgentCard } from "./CompactAgentCard";
import { AgentDetailModal } from "./AgentDetailModal";

interface AgentsGridProps {
  results: AgentResult[];
}

export function AgentsGrid({ results }: AgentsGridProps) {
  const [activeAgent, setActiveAgent] = useState<{
    agent: AgentConfig;
    content: AgentContent;
  } | null>(null);

  const getResult = (agentId: string): AgentResult | undefined =>
    results.find((r) => r.agentId === agentId);

  const doneCount = results.filter((r) => r.status === "done").length;
  const totalCount = AGENTS.length;

  return (
    <div className="w-full space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Validation Report</h2>
          <p className="text-sm text-muted-foreground">
            {doneCount === totalCount
              ? "All agents complete — your venture has been analyzed."
              : `${doneCount}/${totalCount} agents complete…`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums">
            {doneCount}/{totalCount}
          </div>
          <div className="text-xs text-muted-foreground">agents</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${(doneCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENTS.map((agent: AgentConfig, idx: number) => {
          const result = getResult(agent.id);
          const status = result?.status ?? "idle";

          if (status === "done" && result?.content) {
            return (
              <CompactAgentCard
                key={agent.id}
                agent={agent}
                content={result.content}
                onClick={() =>
                  setActiveAgent({ agent, content: result.content! })
                }
              />
            );
          }

          return (
            <div
              key={agent.id}
              className="fade-in-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <AgentSkeleton agent={agent} />
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {activeAgent && (
        <AgentDetailModal
          agent={activeAgent.agent}
          content={activeAgent.content}
          onClose={() => setActiveAgent(null)}
        />
      )}
    </div>
  );
}
