"use client";

import { AgentConfig, AgentContent } from "@/lib/agents";
import { AgentVizRenderer } from "./AgentVizRenderer";

interface Props {
  agent: AgentConfig;
  content: AgentContent;
  onClick: () => void;
}

export function CompactAgentCard({ agent, content, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full h-full flex flex-col overflow-hidden rounded-xl border ${agent.accentBorder} bg-card text-left cursor-pointer hover:shadow-md transition-all duration-200`}
    >
      {/* Agent label strip — fixed height */}
      <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 ${agent.accent}/40 border-b ${agent.accentBorder}`}>
        <agent.icon className={`h-4 w-4 flex-shrink-0 ${agent.accentText}`} />
        <span className={`text-xs font-semibold ${agent.accentText} truncate`}>
          {agent.label}
        </span>
      </div>

      {/* Viz area — fills remaining height, clips inner CardHeader */}
      <div className="relative flex-1 overflow-hidden">
        <div className="-mt-[90px] [&>div]:border-0 [&>div]:shadow-none [&>div]:rounded-none [&>div]:bg-transparent">
          <AgentVizRenderer agent={agent} content={content} />
        </div>
        {/* Gradient fade hides text overflow at the bottom */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-card to-transparent pointer-events-none" />
      </div>
    </button>
  );
}
