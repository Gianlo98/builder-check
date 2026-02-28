"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { ScoreCardData } from "@/lib/viz-schemas";
import { CheckCircle2 } from "lucide-react";

interface ScoreCardVizProps {
  agent: AgentConfig;
  data: ScoreCardData;
  content: AgentContent;
}

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "text-emerald-600",
  neutral: "text-gray-500",
  negative: "text-rose-600",
};

const SENTIMENT_BG: Record<string, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-gray-400",
  negative: "bg-rose-500",
};

export default function ScoreCardViz({ agent, data, content }: ScoreCardVizProps) {
  const scoreColor =
    data.score >= 75
      ? "text-emerald-600"
      : data.score >= 55
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <Card className={`border ${agent.accentBorder} ${agent.accent}/40 fade-in-up`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`text-2xl w-10 h-10 rounded-lg ${agent.accent} flex items-center justify-center border ${agent.accentBorder}`}
          >
            <agent.icon className={`h-5 w-5 ${agent.accentText}`} />
          </div>
          <div className="flex-1">
            <div className={`text-sm font-semibold ${agent.accentText}`}>
              {agent.label}
            </div>
            <div className="text-xs text-muted-foreground">
              {agent.description}
            </div>
          </div>
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score header */}
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold tabular-nums ${scoreColor}`}>
            {data.score}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
          <Badge variant="outline" className={`ml-auto text-xs ${agent.accentText} ${agent.accentBorder}`}>
            {data.scoreLabel}
          </Badge>
        </div>

        {/* Score bar */}
        <div className={`h-2 w-full rounded-full bg-muted border ${agent.accentBorder}`}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              data.score >= 75 ? "bg-emerald-500" : data.score >= 55 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${data.score}%` }}
          />
        </div>

        {/* Items table */}
        <Table>
          <TableBody>
            {data.items.map((item, i) => (
              <TableRow key={i} className="border-0">
                <TableCell className="py-1.5 pl-0 text-xs font-medium">
                  {item.label}
                </TableCell>
                <TableCell className="py-1.5 pr-0 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${SENTIMENT_BG[item.sentiment]}`}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs tabular-nums font-medium ${SENTIMENT_COLORS[item.sentiment]}`}>
                      {item.value}/{item.max}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Summary */}
        <p className="text-sm text-foreground leading-relaxed">{content.summary}</p>

        {/* Bullets */}
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
              <Badge key={tag} variant="outline" className={`text-xs ${agent.accentText} ${agent.accentBorder}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Recommendation */}
        <div className={`rounded-md p-3 ${agent.accent} border ${agent.accentBorder}`}>
          <p className={`text-xs font-medium ${agent.accentText} mb-0.5`}>Recommendation</p>
          <p className="text-xs text-foreground/80 leading-relaxed">{data.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
}
