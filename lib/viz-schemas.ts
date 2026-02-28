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
export type VizData = ScoreCardData | BarChartData | RadarChartData | ProgressListData | TitleCardData | KpiCardData | GaugeData | LineChartData;
