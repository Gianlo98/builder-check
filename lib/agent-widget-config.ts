import type { VizType, VizData } from "@/lib/viz-schemas";
import type { AgentContent } from "@/lib/agents";

export interface WidgetDef {
  id: string;
  label: string;
  vizType: VizType;
  dataKey: string;
}

export const AGENT_WIDGETS: Record<string, WidgetDef[]> = {
  market: [
    { id: "market_score", label: "Market Opportunity", vizType: "scoreCard", dataKey: "market_opportunity" },
    { id: "segments", label: "Market Segmentation", vizType: "stackedBar", dataKey: "segmentation" },
    { id: "adoption", label: "Adoption Curve", vizType: "areaChart", dataKey: "adoption_curve" },
  ],
  competition: [
    { id: "comp_radar", label: "Competitive Positioning", vizType: "radarChart", dataKey: "competitive_positioning" },
    { id: "comp_matrix", label: "Feature Matrix", vizType: "heatmap", dataKey: "feature_matrix" },
  ],
  customer: [
    { id: "customer_fit", label: "ICP Fit Signals", vizType: "progressList", dataKey: "customer_fit" },
    { id: "stakeholders", label: "Key Stakeholders", vizType: "entityList", dataKey: "stakeholders" },
  ],
  business_model: [
    { id: "revenue_metrics", label: "Revenue Model", vizType: "barChart", dataKey: "revenue_metrics" },
    { id: "unit_economics", label: "Unit Economics", vizType: "kpiCard", dataKey: "unit_economics" },
    { id: "pricing", label: "Pricing Strategy", vizType: "distribution", dataKey: "pricing" },
    { id: "financials", label: "Financial Projections", vizType: "dataTable", dataKey: "financials" },
  ],
  risks: [
    { id: "risk_gauge", label: "Risk Assessment", vizType: "gauge", dataKey: "risk_assessment" },
    { id: "effort_impact", label: "Effort vs Impact", vizType: "scatter", dataKey: "effort_impact" },
    { id: "key_insight", label: "Critical Insight", vizType: "insightCallout", dataKey: "key_insight" },
  ],
  gtm: [
    { id: "roadmap", label: "GTM Roadmap", vizType: "timeline", dataKey: "roadmap" },
    { id: "growth", label: "Growth Projection", vizType: "lineChart", dataKey: "growth_projection" },
    { id: "channels", label: "Channel Mix", vizType: "donut", dataKey: "channel_mix" },
    { id: "product_overview", label: "Product Overview", vizType: "titleCard", dataKey: "product_overview" },
    { id: "features", label: "Feature Priority", vizType: "barChartHoriz", dataKey: "feature_priority" },
  ],
};

/**
 * Try to extract a JSON object from text that may contain prose or markdown fences.
 */
function extractJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();

  // Direct parse
  try {
    return JSON.parse(trimmed);
  } catch { /* continue */ }

  // Extract from ```json ... ``` fences (possibly with preamble text)
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch { /* continue */ }
  }

  // Find outermost { ... } block
  const first = trimmed.indexOf("{");
  if (first >= 0) {
    const last = trimmed.lastIndexOf("}");
    if (last > first) {
      try {
        return JSON.parse(trimmed.slice(first, last + 1));
      } catch { /* continue */ }
    }
  }

  return null;
}

/**
 * Parse an agent's raw JSON result and extract per-widget vizData.
 * Returns an AgentContent with the vizWidgets map populated.
 */
export function parseAgentResult(agentId: string, rawContent: string): AgentContent | null {
  const widgets = AGENT_WIDGETS[agentId];
  if (!widgets) return null;

  const parsed = extractJson(rawContent);
  if (!parsed) {
    return {
      summary: rawContent.slice(0, 300),
      bullets: [],
      rawContent,
    };
  }

  const vizWidgets: Record<string, VizData> = {};
  const widgetsData = (parsed.widgets as Record<string, unknown>) ?? parsed;

  for (const widget of widgets) {
    const data = widgetsData[widget.dataKey];
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      if (!d.vizType) {
        d.vizType = widget.vizType;
      }
      vizWidgets[widget.id] = d as unknown as VizData;
    }
  }

  return {
    summary: (parsed.summary as string) ?? "",
    score: parsed.score as number | undefined,
    scoreLabel: (parsed.score_label as string) ?? (parsed.scoreLabel as string),
    bullets: (parsed.bullets as string[]) ?? [],
    tags: (parsed.tags as string[]) ?? [],
    recommendation: parsed.recommendation as string | undefined,
    rawContent,
    vizWidgets,
  };
}

/**
 * Get all widget definitions flattened across all agents.
 */
export function getAllWidgets(): Array<WidgetDef & { agentId: string }> {
  return Object.entries(AGENT_WIDGETS).flatMap(([agentId, widgets]) =>
    widgets.map((w) => ({ ...w, agentId }))
  );
}

/**
 * Get widget count for a specific agent.
 */
export function getWidgetCount(agentId: string): number {
  return AGENT_WIDGETS[agentId]?.length ?? 0;
}
