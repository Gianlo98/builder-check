import {
  TrendingUp,
  Swords,
  Target,
  Coins,
  ShieldAlert,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import type { VizData } from "@/lib/viz-schemas";

export type AgentStatus = "idle" | "loading" | "done" | "error";

export interface AgentConfig {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  accentText: string;
  accentBorder: string;
}

export interface AgentResult {
  agentId: string;
  status: AgentStatus;
  content?: AgentContent;
  error?: string;
}

export interface AgentContent {
  summary: string;
  score?: number;
  scoreLabel?: string;
  bullets: string[];
  tags?: string[];
  recommendation?: string;
  rawContent?: string;
  vizData?: VizData;
  vizWidgets?: Record<string, VizData>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const AGENTS: AgentConfig[] = [
  {
    id: "market",
    label: "Market Opportunity",
    description: "Assesses total addressable market, growth trends, and timing",
    icon: TrendingUp,
    accent: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-200",
  },
  {
    id: "competition",
    label: "Competitive Landscape",
    description: "Maps existing players, moats, and differentiation angles",
    icon: Swords,
    accent: "bg-purple-50",
    accentText: "text-purple-700",
    accentBorder: "border-purple-200",
  },
  {
    id: "customer",
    label: "Target Customer",
    description: "Defines ICP, pain points, and willingness to pay",
    icon: Target,
    accent: "bg-rose-50",
    accentText: "text-rose-700",
    accentBorder: "border-rose-200",
  },
  {
    id: "business_model",
    label: "Business Model",
    description: "Evaluates revenue model, unit economics, and scalability",
    icon: Coins,
    accent: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-200",
  },
  {
    id: "risks",
    label: "Risk Analysis",
    description: "Identifies execution, market, regulatory, and tech risks",
    icon: ShieldAlert,
    accent: "bg-amber-50",
    accentText: "text-amber-700",
    accentBorder: "border-amber-200",
  },
  {
    id: "gtm",
    label: "Go-to-Market",
    description: "Suggests acquisition channels, launch strategy, and positioning",
    icon: Rocket,
    accent: "bg-indigo-50",
    accentText: "text-indigo-700",
    accentBorder: "border-indigo-200",
  },
];

export function getAgentConfig(id: string): AgentConfig | undefined {
  return AGENTS.find((a) => a.id === id);
}
