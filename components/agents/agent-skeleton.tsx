import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AgentConfig } from "@/lib/agents";

interface AgentSkeletonProps {
  agent: AgentConfig;
}

export function AgentSkeleton({ agent }: AgentSkeletonProps) {
  return (
    <Card className={`border ${agent.accentBorder} ${agent.accent}/40 relative overflow-hidden`}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 shimmer opacity-50 pointer-events-none" />

      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${agent.accent} flex items-center justify-center`}>
            <agent.icon className={`h-5 w-5 ${agent.accentText}`} />
          </div>
          <div className="flex-1 space-y-2">
            <div className={`text-sm font-semibold ${agent.accentText}`}>
              {agent.label}
            </div>
            <Skeleton className="h-3 w-4/5" />
          </div>
          {/* Pulsing status indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${agent.accent} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${agent.accentText.replace("text-", "bg-").replace("-700", "-500")}`} />
            </span>
            <span className="text-xs text-muted-foreground">Analyzing…</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Summary line */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />

        {/* Score bar */}
        <div className="pt-1 space-y-1.5">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-10" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Bullet items */}
        <div className="space-y-2 pt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="h-3 w-3 mt-0.5 rounded-full flex-shrink-0" />
              <Skeleton className={`h-3 ${i === 1 ? "w-4/5" : "w-full"}`} />
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex gap-2 pt-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-16 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
