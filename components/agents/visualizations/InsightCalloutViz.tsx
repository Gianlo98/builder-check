"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { InsightCalloutData } from "@/lib/viz-schemas";

interface Props {
  agent: AgentConfig;
  data: InsightCalloutData;
  content: AgentContent;
}

const SENTIMENT_STYLES: Record<string, { box: string; icon: string; label: string }> = {
  positive: {
    box: "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
    icon: "text-emerald-600",
    label: "Positive Signal",
  },
  neutral: {
    box: "bg-slate-50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-700",
    icon: "text-slate-500",
    label: "Neutral Signal",
  },
  negative: {
    box: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800",
    icon: "text-rose-600",
    label: "Risk Signal",
  },
};

const SentimentIcon = ({ sentiment }: { sentiment: string }) => {
  if (sentiment === "positive") return <TrendingUp className="h-5 w-5" />;
  if (sentiment === "negative") return <TrendingDown className="h-5 w-5" />;
  return <Minus className="h-5 w-5" />;
};

export default function InsightCalloutViz({ agent, data, content }: Props) {
  const style = SENTIMENT_STYLES[data.sentiment] ?? SENTIMENT_STYLES.neutral;

  return (
    <Card className={`border ${agent.accentBorder} ${agent.accent}/40 fade-in-up`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`text-2xl w-10 h-10 rounded-lg ${agent.accent} flex items-center justify-center border ${agent.accentBorder}`}>
            <agent.icon className={`h-5 w-5 ${agent.accentText}`} />
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

        <div className={`rounded-lg border p-4 space-y-3 ${style.box}`}>
          <div className="flex items-center gap-2">
            <span className={style.icon}><SentimentIcon sentiment={data.sentiment} /></span>
            <span className={`text-xs font-semibold uppercase tracking-wide ${style.icon}`}>{style.label}</span>
          </div>
          <p className="text-sm font-medium text-foreground leading-relaxed">{data.insight}</p>
          {data.supportingPoints.length > 0 && (
            <ul className="space-y-1.5">
              {data.supportingPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className={`mt-1 h-1 w-1 rounded-full flex-shrink-0 ${style.icon.replace("text-", "bg-")}`} />
                  {pt}
                </li>
              ))}
            </ul>
          )}
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
