"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentConfig, AgentContent } from "@/lib/agents";
import { CheckCircle2 } from "lucide-react";

interface AgentCardProps {
  agent: AgentConfig;
  content: AgentContent;
}

function ScoreBar({
  score,
  label,
  accentText,
  accentBorder,
}: {
  score: number;
  label: string;
  accentText: string;
  accentBorder: string;
}) {
  const color =
    score >= 75 ? "bg-emerald-500" : score >= 55 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`text-sm font-bold ${accentText}`}>{score}/100</span>
      </div>
      <div className={`h-2 w-full rounded-full bg-muted border ${accentBorder}`}>
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function AgentCard({ agent, content }: AgentCardProps) {
  return (
    <Card
      className={`border ${agent.accentBorder} ${agent.accent}/40 fade-in-up`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg ${agent.accent} flex items-center justify-center border ${agent.accentBorder}`}
          >
            <agent.icon className={`h-5 w-5 ${agent.accentText}`} />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${agent.accentText}`}>
              {agent.label}
            </div>
            <div className="text-xs text-muted-foreground">{agent.description}</div>
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-sm text-foreground leading-relaxed">{content.summary}</p>

        {/* Score bar */}
        {content.score !== undefined && content.scoreLabel && (
          <ScoreBar
            score={content.score}
            label={content.scoreLabel}
            accentText={agent.accentText}
            accentBorder={agent.accentBorder}
          />
        )}

        {/* Bullet insights */}
        <ul className="space-y-2">
          {content.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${agent.accentText.replace("text-", "bg-")}`} />
              <span className="text-muted-foreground leading-snug">{bullet}</span>
            </li>
          ))}
        </ul>

        {/* Tags */}
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {content.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`text-xs ${agent.accentText} ${agent.accentBorder}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Recommendation */}
        {content.recommendation && (
          <div className={`rounded-md p-3 ${agent.accent} border ${agent.accentBorder}`}>
            <p className={`text-xs font-medium ${agent.accentText} mb-0.5`}>
              Recommendation
            </p>
            <p className="text-xs text-foreground/80 leading-relaxed">
              {content.recommendation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
