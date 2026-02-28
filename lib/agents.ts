import {
  TrendingUp,
  Swords,
  Target,
  Coins,
  ShieldAlert,
  Rocket,
  Package,
  BarChart2,
  LineChart,
  Layers,
  Users,
  Tag,
  SlidersHorizontal,
  LayoutGrid,
  Share2,
  FileText,
  Network,
  Zap,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

export type AgentStatus = "idle" | "loading" | "done" | "error";

export interface AgentConfig {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind bg color class
  accentText: string; // tailwind text color class
  accentBorder: string; // tailwind border color class
  vizHint: string; // guides AI visualization choice
}

export interface AgentResult {
  agentId: string;
  status: AgentStatus;
  content?: AgentContent;
  error?: string;
}

export interface AgentContent {
  summary: string;
  score?: number; // 0–100
  scoreLabel?: string;
  bullets: string[];
  tags?: string[];
  recommendation?: string;
  rawContent?: string; // raw text from backend specialist agents
  vizData?: import("@/lib/viz-schemas").VizData;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// 19 parallel validation agents — one per visualization type
export const AGENTS: AgentConfig[] = [
  {
    id: "market",
    label: "Market Opportunity",
    description: "Assesses total addressable market, growth trends, and timing",
    icon: TrendingUp,
    accent: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-200",
    vizHint: "scoreCard",
  },
  {
    id: "competition",
    label: "Competitive Landscape",
    description: "Maps existing players, moats, and differentiation angles",
    icon: Swords,
    accent: "bg-purple-50",
    accentText: "text-purple-700",
    accentBorder: "border-purple-200",
    vizHint: "radarChart",
  },
  {
    id: "customer",
    label: "Target Customer",
    description: "Defines ICP, pain points, and willingness to pay",
    icon: Target,
    accent: "bg-rose-50",
    accentText: "text-rose-700",
    accentBorder: "border-rose-200",
    vizHint: "progressList",
  },
  {
    id: "business_model",
    label: "Business Model",
    description: "Evaluates revenue model, unit economics, and scalability",
    icon: Coins,
    accent: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-200",
    vizHint: "barChart",
  },
  {
    id: "risks",
    label: "Risk Analysis",
    description: "Identifies execution, market, regulatory, and tech risks",
    icon: ShieldAlert,
    accent: "bg-amber-50",
    accentText: "text-amber-700",
    accentBorder: "border-amber-200",
    vizHint: "gauge",
  },
  {
    id: "gtm",
    label: "Go-to-Market",
    description: "Suggests acquisition channels, launch strategy, and positioning",
    icon: Rocket,
    accent: "bg-indigo-50",
    accentText: "text-indigo-700",
    accentBorder: "border-indigo-200",
    vizHint: "timeline",
  },
  {
    id: "product",
    label: "Product Overview",
    description: "Summarizes core features, value prop, and product-market fit signals",
    icon: Package,
    accent: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-200",
    vizHint: "titleCard",
  },
  {
    id: "unit_economics",
    label: "Unit Economics",
    description: "Models CAC, LTV, payback period, gross margin, and MRR trajectory",
    icon: BarChart2,
    accent: "bg-purple-50",
    accentText: "text-purple-700",
    accentBorder: "border-purple-200",
    vizHint: "kpiCard",
  },
  {
    id: "growth",
    label: "Growth Projection",
    description: "Projects user and revenue growth trajectory over 12–24 months",
    icon: LineChart,
    accent: "bg-rose-50",
    accentText: "text-rose-700",
    accentBorder: "border-rose-200",
    vizHint: "lineChart",
  },
  {
    id: "segments",
    label: "Market Segmentation",
    description: "Breaks down addressable market by customer segment and vertical",
    icon: Layers,
    accent: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-200",
    vizHint: "stackedBar",
  },
  {
    id: "adoption",
    label: "Adoption Curve",
    description: "Models early adopter, growth, and saturation phases over time",
    icon: Users,
    accent: "bg-amber-50",
    accentText: "text-amber-700",
    accentBorder: "border-amber-200",
    vizHint: "areaChart",
  },
  {
    id: "pricing",
    label: "Pricing Strategy",
    description: "Analyzes price point distribution and competitive tier positioning",
    icon: Tag,
    accent: "bg-indigo-50",
    accentText: "text-indigo-700",
    accentBorder: "border-indigo-200",
    vizHint: "distribution",
  },
  {
    id: "features",
    label: "Feature Prioritization",
    description: "Ranks features by estimated customer value and development effort",
    icon: SlidersHorizontal,
    accent: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-200",
    vizHint: "barChartHoriz",
  },
  {
    id: "competitive_matrix",
    label: "Competitive Feature Matrix",
    description: "Scores feature coverage across key competitors on a heatmap",
    icon: LayoutGrid,
    accent: "bg-purple-50",
    accentText: "text-purple-700",
    accentBorder: "border-purple-200",
    vizHint: "heatmap",
  },
  {
    id: "channels",
    label: "Acquisition Channels",
    description: "Breaks down optimal traffic and acquisition channel mix",
    icon: Share2,
    accent: "bg-rose-50",
    accentText: "text-rose-700",
    accentBorder: "border-rose-200",
    vizHint: "donut",
  },
  {
    id: "financials",
    label: "Financial Projections",
    description: "3-year revenue, burn rate, and path-to-profitability projections",
    icon: FileText,
    accent: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-200",
    vizHint: "dataTable",
  },
  {
    id: "stakeholders",
    label: "Key Stakeholders",
    description: "Identifies investors, partners, champions, and potential blockers",
    icon: Network,
    accent: "bg-amber-50",
    accentText: "text-amber-700",
    accentBorder: "border-amber-200",
    vizHint: "entityList",
  },
  {
    id: "effort_impact",
    label: "Effort vs Impact",
    description: "Plots initiatives by implementation effort against business impact",
    icon: Zap,
    accent: "bg-indigo-50",
    accentText: "text-indigo-700",
    accentBorder: "border-indigo-200",
    vizHint: "scatter",
  },
  {
    id: "key_insight",
    label: "Critical Insight",
    description: "Surfaces the single most important finding across all analysis",
    icon: Lightbulb,
    accent: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-200",
    vizHint: "insightCallout",
  },
];

export function getAgentConfig(id: string): AgentConfig | undefined {
  return AGENTS.find((a) => a.id === id);
}
