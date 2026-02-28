"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { TimelineData } from "@/lib/viz-schemas";

interface Props {
  agent: AgentConfig;
  data: TimelineData;
  content: AgentContent;
}

const SENTIMENT_DOT: Record<string, string> = {
  positive: "bg-emerald-500 border-emerald-600",
  neutral: "bg-slate-400 border-slate-500",
  negative: "bg-rose-500 border-rose-600",
};

const SENTIMENT_DATE: Record<string, string> = {
  positive: "text-emerald-600",
  neutral: "text-muted-foreground",
  negative: "text-rose-600",
};

export default function TimelineViz({ agent, data, content }: Props) {
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

        <div className="relative pl-6 space-y-0">
          {data.events.map((event, i) => (
            <div key={i} className="relative pb-5 last:pb-0">
              {/* Vertical line */}
              {i < data.events.length - 1 && (
                <span className="absolute left-[-13px] top-4 bottom-0 w-px bg-border" />
              )}
              {/* Dot */}
              <span className={`absolute left-[-17px] top-1 h-3 w-3 rounded-full border-2 ${SENTIMENT_DOT[event.sentiment]}`} />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${SENTIMENT_DATE[event.sentiment]}`}>{event.date}</span>
                  <span className="text-sm font-medium text-foreground">{event.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{event.description}</p>
              </div>
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
