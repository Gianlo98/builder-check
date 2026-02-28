"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentResult, AGENTS } from "@/lib/agents";
import { computeOverallScore, getScoreVerdict } from "@/lib/scoring";
import { ScoreRing } from "./score-ring";

interface OverallScoreCardProps {
  results: AgentResult[];
}

export function OverallScoreCard({ results }: OverallScoreCardProps) {
  const doneCount = results.filter((r) => r.status === "done").length;
  const totalCount = AGENTS.length;
  const overallScore = computeOverallScore(results);
  const allDone = doneCount === totalCount;
  const verdict = overallScore != null ? getScoreVerdict(overallScore) : null;

  return (
    <Card className="border">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <ScoreRing score={overallScore} size={140} strokeWidth={10} />

        {verdict ? (
          <Badge
            className={`${verdict.bgClass} ${verdict.colorClass} border-0 text-sm px-3 py-1`}
          >
            {verdict.label}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-sm px-3 py-1">
            Analyzing...
          </Badge>
        )}

        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {allDone
                ? "All agents complete"
                : `${doneCount}/${totalCount} agents`}
            </span>
            {overallScore != null && !allDone && (
              <span className="italic">Partial score</span>
            )}
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
