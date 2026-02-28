export type AgentStatus = "idle" | "loading" | "done" | "error";

export interface AgentConfig {
  id: string;
  label: string;
  description: string;
  icon: string;
  accent: string; // tailwind bg color class
  accentText: string; // tailwind text color class
  accentBorder: string; // tailwind border color class
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
}

// The 6 parallel validation agents
export const AGENTS: AgentConfig[] = [
  {
    id: "market",
    label: "Market Opportunity",
    description: "Assesses total addressable market, growth trends, and timing",
    icon: "📈",
    accent: "bg-blue-50",
    accentText: "text-blue-700",
    accentBorder: "border-blue-200",
  },
  {
    id: "competition",
    label: "Competitive Landscape",
    description: "Maps existing players, moats, and differentiation angles",
    icon: "⚔️",
    accent: "bg-purple-50",
    accentText: "text-purple-700",
    accentBorder: "border-purple-200",
  },
  {
    id: "customer",
    label: "Target Customer",
    description: "Defines ICP, pain points, and willingness to pay",
    icon: "🎯",
    accent: "bg-rose-50",
    accentText: "text-rose-700",
    accentBorder: "border-rose-200",
  },
  {
    id: "business_model",
    label: "Business Model",
    description: "Evaluates revenue model, unit economics, and scalability",
    icon: "💰",
    accent: "bg-emerald-50",
    accentText: "text-emerald-700",
    accentBorder: "border-emerald-200",
  },
  {
    id: "risks",
    label: "Risk Analysis",
    description: "Identifies execution, market, regulatory, and tech risks",
    icon: "⚠️",
    accent: "bg-amber-50",
    accentText: "text-amber-700",
    accentBorder: "border-amber-200",
  },
  {
    id: "gtm",
    label: "Go-to-Market",
    description: "Suggests acquisition channels, launch strategy, and positioning",
    icon: "🚀",
    accent: "bg-indigo-50",
    accentText: "text-indigo-700",
    accentBorder: "border-indigo-200",
  },
];

export function getAgentConfig(id: string): AgentConfig | undefined {
  return AGENTS.find((a) => a.id === id);
}
