"use client";

import { AgentConfig, AgentContent } from "@/lib/agents";
import { AgentVizRenderer } from "./AgentVizRenderer";

interface Props {
  agent: AgentConfig;
  content: AgentContent;
  widgetLabel?: string;
  onClick: () => void;
}

export function CompactAgentCard({ agent, content, widgetLabel, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full h-full flex flex-col overflow-hidden rounded-xl border ${agent.accentBorder} bg-card text-left cursor-pointer hover:shadow-md transition-all duration-200`}
    >
      {/* Widget label strip */}
      <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 ${agent.accent}/40 border-b ${agent.accentBorder}`}>
        <agent.icon className={`h-4 w-4 flex-shrink-0 ${agent.accentText}`} />
        <span className={`text-xs font-semibold ${agent.accentText} truncate`}>
          {widgetLabel ?? agent.label}
        </span>
      </div>

      {/* Viz area — hide the inner card chrome, show only the chart content */}
      <div className="relative flex-1 overflow-hidden">
        <div className="[&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:bg-transparent [&>div>div:first-child]:hidden">
          <AgentVizRenderer agent={agent} content={content} />
        </div>
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </div>
    </button>
  );
}
