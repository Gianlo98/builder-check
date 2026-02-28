"use client";

import { AGENTS, AgentResult } from "@/lib/agents";
import { MiniScoreCard } from "./mini-score-card";

interface ScoreOverviewGridProps {
  results: AgentResult[];
  onAgentClick?: (agentId: string) => void;
}

export function ScoreOverviewGrid({ results, onAgentClick }: ScoreOverviewGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {AGENTS.map((agent) => {
        const result = results.find((r) => r.agentId === agent.id);
        return (
          <MiniScoreCard
            key={agent.id}
            agent={agent}
            result={result}
            onClick={() => onAgentClick?.(agent.id)}
          />
        );
      })}
    </div>
  );
}
