"use client";

import { useState } from "react";
import { AgentResult, AgentConfig, AgentContent, AGENTS } from "@/lib/agents";
import { AGENT_WIDGETS, type WidgetDef } from "@/lib/agent-widget-config";
import { getVizColSpan } from "@/lib/viz-layout";
import { AgentCard } from "./agent-card";
import { CompactAgentCard } from "./CompactAgentCard";
import { AgentDetailModal } from "./AgentDetailModal";
import { Loader2, CheckCircle2 } from "lucide-react";

function hasAnyWidgetData(content: AgentContent, widgets: WidgetDef[]): boolean {
  if (!content.vizWidgets) return false;
  return widgets.some((w) => content.vizWidgets?.[w.id] != null);
}

interface AgentsGridProps {
  results: AgentResult[];
}

function WidgetSkeleton({ label }: { label: string }) {
  return (
    <div className="h-full rounded-xl border bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 shimmer opacity-50 pointer-events-none" />
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center space-y-2">
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function AgentsGrid({ results }: AgentsGridProps) {
  const [activeModal, setActiveModal] = useState<{
    agent: AgentConfig;
    content: AgentContent;
    widgetLabel?: string;
  } | null>(null);

  const getResult = (agentId: string): AgentResult | undefined =>
    results.find((r) => r.agentId === agentId);

  const doneCount = results.filter((r) => r.status === "done").length;
  const totalCount = AGENTS.length;

  return (
    <div className="w-full space-y-8">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Validation Report</h2>
          <p className="text-sm text-muted-foreground">
            {doneCount === totalCount
              ? "All agents complete — your venture has been analyzed."
              : `${doneCount}/${totalCount} agents complete…`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums">
            {doneCount}/{totalCount}
          </div>
          <div className="text-xs text-muted-foreground">agents</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
          style={{ width: `${(doneCount / totalCount) * 100}%` }}
        />
      </div>

      {/* Agent sections */}
      {AGENTS.map((agent) => {
        const result = getResult(agent.id);
        const status = result?.status ?? "idle";
        const widgets = AGENT_WIDGETS[agent.id] ?? [];
        const content = result?.content;
        const Icon = agent.icon;

        if (status === "idle") return null;

        return (
          <div key={agent.id} className="space-y-3">
            {/* Agent section header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg ${agent.accent} flex items-center justify-center border ${agent.accentBorder}`}
              >
                <Icon className={`h-4 w-4 ${agent.accentText}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold ${agent.accentText}`}>
                  {agent.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {agent.description}
                </div>
              </div>
              {status === "loading" && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Analyzing…
                  </span>
                </div>
              )}
              {status === "done" && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              )}
            </div>

            {/* Widget sub-grid */}
            {status === "loading" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[220px]">
                {widgets.map((w) => {
                  const colSpan = getVizColSpan(w.vizType);
                  return (
                    <div
                      key={w.id}
                      className={colSpan === 2 ? "md:col-span-2" : ""}
                    >
                      <WidgetSkeleton label={w.label} />
                    </div>
                  );
                })}
              </div>
            )}

            {status === "done" && content && (
              <>
                {hasAnyWidgetData(content, widgets) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 auto-rows-[300px] [grid-auto-flow:dense]">
                    {widgets.map((w: WidgetDef) => {
                      const vizData = content.vizWidgets?.[w.id];
                      if (!vizData) return null;

                      const colSpan = getVizColSpan(w.vizType);
                      const widgetContent: AgentContent = {
                        ...content,
                        vizData: vizData,
                      };

                      return (
                        <div
                          key={w.id}
                          className={`h-full ${colSpan === 2 ? "md:col-span-2" : ""}`}
                        >
                          <CompactAgentCard
                            agent={agent}
                            content={widgetContent}
                            widgetLabel={w.label}
                            onClick={() =>
                              setActiveModal({
                                agent,
                                content: widgetContent,
                                widgetLabel: w.label,
                              })
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <AgentCard agent={agent} content={content} />
                )}
              </>
            )}
          </div>
        );
      })}

      {/* Detail modal */}
      {activeModal && (
        <AgentDetailModal
          agent={activeModal.agent}
          content={activeModal.content}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
