"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { AgentConfig, AgentContent } from "@/lib/agents";
import type { RadarChartData } from "@/lib/viz-schemas";
import { CheckCircle2 } from "lucide-react";

interface RadarChartVizProps {
  agent: AgentConfig;
  data: RadarChartData;
  content: AgentContent;
}

const ACCENT_HEX: Record<string, string> = {
  "text-blue-700": "hsl(221.2 83.2% 53.3%)",
  "text-purple-700": "hsl(262.1 83.3% 57.8%)",
  "text-rose-700": "hsl(346.8 77.2% 49.8%)",
  "text-emerald-700": "hsl(142.1 76.2% 36.3%)",
  "text-amber-700": "hsl(32.1 94.6% 43.7%)",
  "text-indigo-700": "hsl(243.4 75.4% 58.6%)",
};

export default function RadarChartViz({ agent, data, content }: RadarChartVizProps) {
  const accentColor = ACCENT_HEX[agent.accentText] ?? "hsl(262.1 83.3% 57.8%)";

  const chartConfig: ChartConfig = {
    value: {
      label: data.title,
      color: accentColor,
    },
  };

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

        {/* Radar Chart */}
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <RadarChart data={data.axes} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="axis"
              tick={{ fontSize: 10, fill: "#6b7280" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, "dataMax"]}
              tick={{ fontSize: 9 }}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar
              name={data.title}
              dataKey="value"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>

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
