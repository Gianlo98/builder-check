"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { CheckCircle2 } from "lucide-react";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { DonutData } from "@/lib/viz-schemas";

const PALETTE = [
  "hsl(221.2 83.2% 53.3%)",
  "hsl(262.1 83.3% 57.8%)",
  "hsl(142.1 76.2% 36.3%)",
  "hsl(32.1 94.6% 43.7%)",
  "hsl(346.8 77.2% 49.8%)",
  "hsl(243.4 75.4% 58.6%)",
];

interface Props {
  agent: AgentConfig;
  data: DonutData;
  content: AgentContent;
}

export default function DonutViz({ agent, data, content }: Props) {
  const chartConfig: ChartConfig = Object.fromEntries(
    data.slices.map((s, i) => [s.name, { label: s.name, color: PALETTE[i % PALETTE.length] }])
  );

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

        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data.slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={2}
            >
              {data.slices.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {data.slices.map((s, i) => (
            <div key={s.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
              {s.name} ({s.value})
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
