"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { GaugeData } from "@/lib/viz-schemas";

interface Props {
  agent: AgentConfig;
  data: GaugeData;
  content: AgentContent;
}

export default function GaugeViz({ agent, data, content }: Props) {
  const r = 70;
  const circ = 2 * Math.PI * r;
  const halfCirc = circ / 2;
  const offset = halfCirc * (1 - data.score / 100);
  const gaugeColor =
    data.score >= 75
      ? "hsl(142, 76%, 36%)"
      : data.score >= 50
      ? "hsl(32, 95%, 44%)"
      : "hsl(347, 77%, 50%)";

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

        {/* SVG Gauge */}
        <div className="flex flex-col items-center">
          <svg width="180" height="100" viewBox="0 0 180 100">
            {/* Background arc */}
            <circle
              cx="90"
              cy="90"
              r={r}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              strokeDasharray={`${halfCirc} ${circ}`}
              strokeLinecap="round"
              transform="rotate(180 90 90)"
            />
            {/* Foreground arc */}
            <circle
              cx="90"
              cy="90"
              r={r}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="12"
              strokeDasharray={`${halfCirc} ${circ}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(180 90 90)"
            />
            <text
              x="90"
              y="80"
              textAnchor="middle"
              className="fill-foreground text-2xl font-bold"
              fontSize="28"
            >
              {data.score}
            </text>
          </svg>
          <p className="text-xs text-muted-foreground mt-1">{data.sublabel}</p>
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
