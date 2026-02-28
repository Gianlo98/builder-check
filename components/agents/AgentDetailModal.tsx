"use client";

import { useEffect } from "react";
import { AgentConfig, AgentContent } from "@/lib/agents";
import { AgentVizRenderer } from "./AgentVizRenderer";
import { X } from "lucide-react";

interface Props {
  agent: AgentConfig;
  content: AgentContent;
  onClose: () => void;
}

export function AgentDetailModal({ agent, content, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 p-1.5 hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <AgentVizRenderer agent={agent} content={content} />
      </div>
    </div>
  );
}
