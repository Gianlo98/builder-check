import { AgentResult } from "./agents";

export function computeOverallScore(results: AgentResult[]): number | null {
  const scores = results
    .filter((r) => r.status === "done" && r.content?.score != null)
    .map((r) => r.content!.score!);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export interface ScoreVerdict {
  label: string;
  colorClass: string;
  bgClass: string;
}

export function getScoreVerdict(score: number): ScoreVerdict {
  if (score >= 80)
    return { label: "Strong", colorClass: "text-emerald-600", bgClass: "bg-emerald-50" };
  if (score >= 65)
    return { label: "Promising", colorClass: "text-amber-600", bgClass: "bg-amber-50" };
  if (score >= 50)
    return { label: "Needs Work", colorClass: "text-orange-600", bgClass: "bg-orange-50" };
  return { label: "High Risk", colorClass: "text-rose-600", bgClass: "bg-rose-50" };
}

export function getScoreBarColor(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-500";
  return "bg-rose-500";
}
