"use client";

import { AgentConfig, AgentResult } from "@/lib/agents";
import { getScoreBarColor } from "@/lib/scoring";
import { Skeleton } from "@/components/ui/skeleton";

interface MiniScoreCardProps {
  agent: AgentConfig;
  result?: AgentResult;
  onClick?: () => void;
}

export function MiniScoreCard({ agent, result, onClick }: MiniScoreCardProps) {
  const isDone = result?.status === "done" && result.content?.score != null;
  const score = result?.content?.score;
  const barColor = score != null ? getScoreBarColor(score) : "bg-muted";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-2 p-3 rounded-lg border transition-all text-left w-full ${agent.accentBorder} ${agent.accent}/30 hover:shadow-sm`}
    >
      <div className="flex items-center gap-2">
        <agent.icon className={`h-4 w-4 ${agent.accentText} flex-shrink-0`} />
        <span className="text-xs font-medium text-muted-foreground truncate flex-1">
          {agent.label}
        </span>
      </div>
      {isDone ? (
        <>
          <span className={`text-2xl font-bold tabular-nums ${agent.accentText}`}>
            {score}
          </span>
          <div className="h-1 w-full rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${barColor} transition-all duration-700`}
              style={{ width: `${score}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <Skeleton className="h-7 w-12" />
          <Skeleton className="h-1 w-full rounded-full" />
        </>
      )}
    </button>
  );
}
