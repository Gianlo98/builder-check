"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { ProgressListData } from "@/lib/viz-schemas";
import { CheckCircle2 } from "lucide-react";

interface ProgressListVizProps {
  agent: AgentConfig;
  data: ProgressListData;
  content: AgentContent;
}

const SENTIMENT_DOT: Record<string, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-gray-400",
  negative: "bg-rose-500",
};

const SENTIMENT_BAR: Record<string, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-gray-400",
  negative: "bg-rose-500",
};

export default function ProgressListViz({ agent, data, content }: ProgressListVizProps) {
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
        {/* Score */}
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tabular-nums ${agent.accentText}`}>
            {data.score}
          </span>
          <span className="text-sm text-muted-foreground">/ 100 — {data.scoreLabel}</span>
        </div>

        {/* Progress items table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-8 pl-0 text-xs">Metric</TableHead>
              <TableHead className="h-8 text-xs">Progress</TableHead>
              <TableHead className="h-8 pr-0 text-right text-xs">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="py-2 pl-0 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${SENTIMENT_DOT[item.sentiment]}`} />
                    {item.label}
                  </div>
                </TableCell>
                <TableCell className="py-2">
                  <div className="w-full h-1.5 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${SENTIMENT_BAR[item.sentiment]}`}
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </TableCell>
                <TableCell className="py-2 pr-0 text-right text-xs tabular-nums font-medium">
                  {item.value}/{item.max}
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
