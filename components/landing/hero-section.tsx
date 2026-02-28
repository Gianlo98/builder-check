import { Badge } from "@/components/ui/badge";
import { ResearchInput } from "./research-input";

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-background to-muted/30">
      {/* Top badge */}
      <div className="mb-6">
        <Badge variant="outline" className="gap-1.5 text-xs px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
          19 AI agents · runs in parallel
        </Badge>
      </div>

      {/* Headline */}
      <div className="text-center space-y-4 mb-10 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          Validate your{" "}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            startup idea
          </span>
          <br />
          in minutes.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Describe your venture and six specialized AI agents will instantly
          analyze market opportunity, competition, customers, business model,
          risks, and go-to-market strategy.
        </p>
      </div>

      {/* Agent pills preview */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-2xl">
        {[
          { icon: "📈", label: "Market" },
          { icon: "⚔️", label: "Competition" },
          { icon: "🎯", label: "Customers" },
          { icon: "💰", label: "Business Model" },
          { icon: "⚠️", label: "Risks" },
          { icon: "🚀", label: "Go-to-Market" },
        ].map((a) => (
          <span
            key={a.label}
            className="text-xs border rounded-full px-3 py-1 bg-background text-muted-foreground flex items-center gap-1.5"
          >
            <span>{a.icon}</span>
            {a.label}
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="w-full max-w-2xl">
        <ResearchInput />
      </div>
    </section>
  );
}
