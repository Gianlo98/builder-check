"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

const EXAMPLE_PROMPTS = [
  "An AI tool that helps solo founders write cold outreach emails",
  "A B2B SaaS for managing restaurant supplier relationships",
  "A marketplace connecting freelance designers with DTC brands",
];

export function ResearchInput() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (!query.trim() || query.trim().length < 5) return;
    router.push(`/report?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="relative">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
          placeholder="Describe your startup idea or hypothesis…

e.g. &quot;A tool that helps indie game devs monetize their Discord communities&quot;"
          className="min-h-[120px] resize-none pr-4 text-base leading-relaxed"
          autoFocus
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.slice(0, 2).map((p) => (
            <button
              key={p}
              onClick={() => setQuery(p)}
              className="text-xs text-muted-foreground hover:text-foreground border border-dashed rounded-full px-3 py-1 transition-colors hover:border-foreground/30"
            >
              {p.length > 42 ? p.slice(0, 42) + "…" : p}
            </button>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={query.trim().length < 5}
          size="lg"
          className="flex-shrink-0 gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Validate idea
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        ⌘ + Enter to submit · 19 AI agents will run in parallel
      </p>
    </div>
  );
}
