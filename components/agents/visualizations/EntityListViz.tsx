"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { EntityListData } from "@/lib/viz-schemas";

interface Props {
  agent: AgentConfig;
  data: EntityListData;
  content: AgentContent;
}

const SENTIMENT_BADGE: Record<string, string> = {
  positive: "bg-emerald-100 text-emerald-700 border-emerald-200",
  neutral: "bg-muted text-muted-foreground border-border",
  negative: "bg-rose-100 text-rose-700 border-rose-200",
};

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function EntityListViz({ agent, data, content }: Props) {
  return (
    <Card className={`border ${agent.accentBorder} ${agent.accent}/40 fade-in-up`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`text-2xl w-10 h-10 rounded-lg ${agent.accent} flex items-center justify-center border ${agent.accentBorder}`}>
            {agent.icon}
          </div>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${agent.accentText}`}>{agent.label}</div>
            <div className="text-xs text-muted-foreground">{agent.description}</div>
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tabular-nums ${agent.accentText}`}>{data.score}</span>
          <span className="text-sm text-muted-foreground">/ 100 — {data.scoreLabel}</span>
        </div>

        <div className="space-y-2">
          {data.entities.map((entity, i) => (
            <div key={i} className="flex items-center gap-3 rounded-md p-2 bg-muted/40 border border-border/50">
              <div className={`h-8 w-8 rounded-full ${agent.accent} border ${agent.accentBorder} flex items-center justify-center flex-shrink-0`}>
                <span className={`text-xs font-bold ${agent.accentText}`}>{initials(entity.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entity.name}</p>
                <p className="text-xs text-muted-foreground">{entity.role}</p>
              </div>
              <Badge variant="outline" className={`text-xs flex-shrink-0 ${SENTIMENT_BADGE[entity.sentiment]}`}>
                {entity.badge}
              </Badge>
            </div>
          ))}
        </div>

        <p className="text-sm text-foreground leading-relaxed">{content.summary}</p>
        <ul className="space-y-2">
          {content.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${agent.accentText.replace("text-", "bg-")}`} />
              <span className="text-muted-foreground leading-snug">{b}</span>
            </li>
          ))}
        </ul>
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {content.tags.map((tag) => (
              <Badge key={tag} variant="outline" className={`text-xs ${agent.accentText} ${agent.accentBorder}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className={`rounded-md p-3 ${agent.accent} border ${agent.accentBorder}`}>
          <p className={`text-xs font-medium ${agent.accentText} mb-0.5`}>Recommendation</p>
          <p className="text-xs text-foreground/80 leading-relaxed">{data.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
