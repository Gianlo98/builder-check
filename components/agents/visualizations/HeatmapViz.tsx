"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { HeatmapData } from "@/lib/viz-schemas";

interface Props {
  agent: AgentConfig;
  data: HeatmapData;
  content: AgentContent;
}

function cellColor(value: number): string {
  if (value >= 75) return "bg-emerald-500/80 text-white";
  if (value >= 50) return "bg-amber-400/80 text-white";
  if (value >= 25) return "bg-orange-400/80 text-white";
  return "bg-rose-500/80 text-white";
}

export default function HeatmapViz({ agent, data, content }: Props) {
  const cellMap: Record<string, Record<string, number>> = {};
  for (const cell of data.cells) {
    if (!cellMap[cell.row]) cellMap[cell.row] = {};
    cellMap[cell.row][cell.col] = cell.value;
  }

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

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="p-1 text-left text-muted-foreground font-normal w-20" />
                {data.cols.map((col) => (
                  <th key={col} className="p-1 text-center text-muted-foreground font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row}>
                  <td className="p-1 text-muted-foreground font-medium text-right pr-2">{row}</td>
                  {data.cols.map((col) => {
                    const val = cellMap[row]?.[col] ?? 0;
                    return (
                      <td key={col} className="p-0.5">
                        <div className={`rounded text-center py-1.5 px-1 ${cellColor(val)} tabular-nums`}>
                          {val}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
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
