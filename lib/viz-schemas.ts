import { z } from "zod";

export const ScoreCardSchema = z.object({
  vizType: z.literal("scoreCard"),
  title: z.string(),
  score: z.number().describe("Score from 0 to 100"),
  scoreLabel: z.string(),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      max: z.number(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
    })
  ),
  recommendation: z.string(),
});

export const BarChartSchema = z.object({
  vizType: z.literal("barChart"),
  title: z.string(),
  score: z.number().describe("Score from 0 to 100"),
  scoreLabel: z.string(),
  bars: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
    })
  ),
  recommendation: z.string(),
});

export const RadarChartSchema = z.object({
  vizType: z.literal("radarChart"),
  title: z.string(),
  score: z.number().describe("Score from 0 to 100"),
  scoreLabel: z.string(),
  axes: z.array(
    z.object({
      axis: z.string(),
      value: z.number(),
      fullMark: z.number(),
    })
  ),
  recommendation: z.string(),
});

export const ProgressListSchema = z.object({
  vizType: z.literal("progressList"),
  title: z.string(),
  score: z.number().describe("Score from 0 to 100"),
  scoreLabel: z.string(),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      max: z.number(),
      sentiment: z.enum(["positive", "neutral", "negative"]),
    })
  ),
  recommendation: z.string(),
});

export const TitleCardSchema = z.object({
  vizType: z.literal("titleCard"),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  badge: z.string(),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const DistributionSchema = z.object({
  vizType: z.literal("distribution"),
  title: z.string(),
  xLabel: z.string(),
  bins: z.array(z.object({ range: z.string(), count: z.number() })),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const AreaChartSchema = z.object({
  vizType: z.literal("areaChart"),
  title: z.string(),
  xLabel: z.string(),
  areas: z.array(
    z.object({
      name: z.string(),
      data: z.array(z.object({ x: z.string(), y: z.number() })),
    })
  ),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const StackedBarSchema = z.object({
  vizType: z.literal("stackedBar"),
  title: z.string(),
  categories: z.array(z.string()),
  bars: z.array(
    z.object({
      name: z.string(),
      segments: z.array(z.object({ label: z.string(), value: z.number() })),
    })
  ),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const LineChartSchema = z.object({
  vizType: z.literal("lineChart"),
  title: z.string(),
  xLabel: z.string(),
  yLabel: z.string(),
  lines: z.array(
    z.object({
      name: z.string(),
      data: z.array(z.object({ x: z.string(), y: z.number() })),
    })
  ),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const GaugeSchema = z.object({
  vizType: z.literal("gauge"),
  title: z.string(),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  sublabel: z.string(),
  recommendation: z.string(),
});

export const KpiCardSchema = z.object({
  vizType: z.literal("kpiCard"),
  title: z.string(),
  metrics: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      delta: z.string(),
      deltaDirection: z.enum(["up", "down", "neutral"]),
    })
  ),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const ScatterSchema = z.object({
  vizType: z.literal("scatter"),
  title: z.string(),
  xLabel: z.string(),
  yLabel: z.string(),
  points: z.array(z.object({ x: z.number(), y: z.number(), label: z.string() })),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const HeatmapSchema = z.object({
  vizType: z.literal("heatmap"),
  title: z.string(),
  rows: z.array(z.string()),
  cols: z.array(z.string()),
  cells: z.array(z.object({ row: z.string(), col: z.string(), value: z.number().describe("0-100") })),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const DonutSchema = z.object({
  vizType: z.literal("donut"),
  title: z.string(),
  slices: z.array(z.object({ name: z.string(), value: z.number() })),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const DataTableSchema = z.object({
  vizType: z.literal("dataTable"),
  title: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.object({ cells: z.array(z.string()) })),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const EntityListSchema = z.object({
  vizType: z.literal("entityList"),
  title: z.string(),
  entities: z.array(z.object({
    name: z.string(),
    role: z.string(),
    badge: z.string(),
    sentiment: z.enum(["positive", "neutral", "negative"]),
  })),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const TimelineSchema = z.object({
  vizType: z.literal("timeline"),
  title: z.string(),
  events: z.array(z.object({
    date: z.string(),
    label: z.string(),
    description: z.string(),
    sentiment: z.enum(["positive", "neutral", "negative"]),
  })),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const InsightCalloutSchema = z.object({
  vizType: z.literal("insightCallout"),
  title: z.string(),
  insight: z.string(),
  sentiment: z.enum(["positive", "neutral", "negative"]),
  supportingPoints: z.array(z.string()),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

export const BarChartHorizSchema = z.object({
  vizType: z.literal("barChartHoriz"),
  title: z.string(),
  bars: z.array(z.object({ name: z.string(), value: z.number() })),
  score: z.number().describe("0-100"),
  scoreLabel: z.string(),
  recommendation: z.string(),
});

// Per-vizType response schemas (avoids oneOf/discriminatedUnion which Anthropic doesn't support)
const vizSchemaMap = {
  scoreCard: ScoreCardSchema,
  barChart: BarChartSchema,
  radarChart: RadarChartSchema,
  progressList: ProgressListSchema,
  titleCard: TitleCardSchema,
  kpiCard: KpiCardSchema,
  gauge: GaugeSchema,
  lineChart: LineChartSchema,
  stackedBar: StackedBarSchema,
  areaChart: AreaChartSchema,
  distribution: DistributionSchema,
  scatter: ScatterSchema,
  heatmap: HeatmapSchema,
  donut: DonutSchema,
  dataTable: DataTableSchema,
  entityList: EntityListSchema,
  timeline: TimelineSchema,
  insightCallout: InsightCalloutSchema,
  barChartHoriz: BarChartHorizSchema,
} as const;

export type VizType = keyof typeof vizSchemaMap;

export function getAgentResponseSchema(vizHint: string) {
  const vizSchema = vizSchemaMap[vizHint as VizType] ?? ScoreCardSchema;
  return z.object({
    summary: z.string(),
    bullets: z.array(z.string()),
    tags: z.array(z.string()),
    vizData: vizSchema,
  });
}

export type ScoreCardData = z.infer<typeof ScoreCardSchema>;
export type BarChartData = z.infer<typeof BarChartSchema>;
export type RadarChartData = z.infer<typeof RadarChartSchema>;
export type ProgressListData = z.infer<typeof ProgressListSchema>;
export type TitleCardData = z.infer<typeof TitleCardSchema>;
export type KpiCardData = z.infer<typeof KpiCardSchema>;
export type GaugeData = z.infer<typeof GaugeSchema>;
export type LineChartData = z.infer<typeof LineChartSchema>;
export type StackedBarData = z.infer<typeof StackedBarSchema>;
export type AreaChartData = z.infer<typeof AreaChartSchema>;
export type DistributionData = z.infer<typeof DistributionSchema>;
export type ScatterData = z.infer<typeof ScatterSchema>;
export type HeatmapData = z.infer<typeof HeatmapSchema>;
export type DonutData = z.infer<typeof DonutSchema>;
export type DataTableData = z.infer<typeof DataTableSchema>;
export type EntityListData = z.infer<typeof EntityListSchema>;
export type TimelineData = z.infer<typeof TimelineSchema>;
export type InsightCalloutData = z.infer<typeof InsightCalloutSchema>;
export type BarChartHorizData = z.infer<typeof BarChartHorizSchema>;
export type VizData = ScoreCardData | BarChartData | RadarChartData | ProgressListData | TitleCardData | KpiCardData | GaugeData | LineChartData | StackedBarData | AreaChartData | DistributionData | ScatterData | HeatmapData | DonutData | DataTableData | EntityListData | TimelineData | InsightCalloutData | BarChartHorizData;
