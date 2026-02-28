import { NextRequest } from "next/server";
import { AGENTS, AgentContent } from "@/lib/agents";

// ---------------------------------------------------------------------------
// Mock AI responses — replace each `generateAgentContent` call with a real
// LLM API call (e.g. Anthropic claude-sonnet-4-6) to go production-ready.
// ---------------------------------------------------------------------------

function generateAgentContent(agentId: string, query: string): AgentContent {
  const mocks: Record<string, AgentContent> = {
    market: {
      summary:
        "The market shows strong signals for this problem space with compound annual growth projected in double digits.",
      score: 78,
      scoreLabel: "Market Score",
      bullets: [
        "Global TAM estimated at $12–18B by 2027 based on analogous verticals",
        "Macro tailwinds: AI adoption, remote work, and cost-cutting pressures align",
        "Category is in early-growth phase — low saturation, high fragmentation",
        "Regulatory environment is neutral-to-favorable in key markets (US, EU)",
      ],
      tags: ["High Growth", "Fragmented", "AI Tailwind"],
      recommendation:
        "Strong timing. Enter now to establish category position before consolidation.",
    },
    competition: {
      summary:
        "The competitive field has incumbents but no dominant player has locked in the specific niche.",
      score: 65,
      scoreLabel: "Differentiation Score",
      bullets: [
        "3–4 direct competitors with $5M–$50M ARR — none at escape velocity",
        "Incumbents solving adjacent problems but missing this exact workflow gap",
        "Key moat opportunity: proprietary data flywheel + network effects",
        "VC-funded competition likely to intensify; 12–18 month window to differentiate",
      ],
      tags: ["Differentiation Possible", "VC Backed Rivals", "Niche Open"],
      recommendation:
        "Win on depth and vertical focus. Generalist players can't move fast enough.",
    },
    customer: {
      summary:
        "Clear ICP exists with identifiable pain, budget authority, and urgency to act.",
      score: 82,
      scoreLabel: "Customer Fit Score",
      bullets: [
        "Primary ICP: mid-market ops and product teams (50–500 employees)",
        "Pain is felt weekly; users currently stitching together 3–5 tools",
        "Budget range $500–$2,000/mo per team — within discretionary spend",
        "Champions are mid-level ICs; economic buyer is VP-level — short sales cycle",
      ],
      tags: ["Defined ICP", "Recurring Pain", "Budget Confirmed"],
      recommendation:
        "Start with bottoms-up PLG motion targeting ICs; upsell to team plans.",
    },
    business_model: {
      summary:
        "SaaS subscription model is the natural fit with strong unit economics potential.",
      score: 74,
      scoreLabel: "Model Viability Score",
      bullets: [
        "Seat-based SaaS: ~$50–150/seat/mo is defensible in this segment",
        "Land-and-expand: initial 3-seat deal → 15-seat expansion within 6 months",
        "Gross margins 70–80% achievable once infrastructure costs stabilize",
        "Payback period <12 months at $2K ACV with 20% monthly growth",
      ],
      tags: ["SaaS", "Land & Expand", "High Margin"],
      recommendation:
        "Launch with a usage-based free tier to accelerate top-of-funnel adoption.",
    },
    risks: {
      summary:
        "Primary risks are execution-speed and distribution, not market or technical validity.",
      score: 58,
      scoreLabel: "Risk-Adjusted Score",
      bullets: [
        "Execution risk: thin founding team in sales/go-to-market function",
        "Copycat risk: well-funded competitor could replicate MVP in 3–4 months",
        "Churn risk: switching cost is low in early versions — need to build stickiness",
        "Regulatory: GDPR/SOC2 compliance required before enterprise deals",
      ],
      tags: ["Execution Risk", "Moderate Risk", "Mitigatable"],
      recommendation:
        "Hire a sales/growth co-founder early. Build data lock-in features in Month 1.",
    },
    gtm: {
      summary:
        "PLG-led motion with community and content amplification is the optimal launch path.",
      score: 71,
      scoreLabel: "GTM Readiness Score",
      bullets: [
        "Channel 1: Bottom-up PLG — free tier targeted at indie users and small teams",
        "Channel 2: Founder-led content on LinkedIn/Twitter to build category authority",
        "Channel 3: Integration partnerships with tools in existing workflow (Notion, Slack)",
        "Channel 4: Niche community presence (relevant Slack groups, subreddits, Discords)",
      ],
      tags: ["PLG", "Content-Led", "Community"],
      recommendation:
        "First 90 days: 50 design partners, 500 waitlist, 1 anchor integration live.",
    },
  };

  return (
    mocks[agentId] ?? {
      summary: `Analysis complete for: ${query}`,
      bullets: ["Key insight 1", "Key insight 2", "Key insight 3"],
      tags: ["Analyzed"],
    }
  );
}

// Each agent has a different simulated latency to mimic real parallel AI calls
const AGENT_DELAYS: Record<string, number> = {
  market: 2200,
  competition: 3100,
  customer: 1800,
  business_model: 2700,
  risks: 3400,
  gtm: 2400,
};

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || typeof query !== "string" || query.trim().length < 5) {
    return new Response(JSON.stringify({ error: "Query too short" }), {
      status: 400,
    });
  }

  // Server-Sent Events response
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Emit "loading" status for all agents immediately
      for (const agent of AGENTS) {
        send({ agentId: agent.id, status: "loading" });
      }

      // Run all agents in parallel with their individual delays
      const agentPromises = AGENTS.map(async (agent) => {
        const delay = AGENT_DELAYS[agent.id] ?? 2500;
        await new Promise((resolve) => setTimeout(resolve, delay));

        const content = generateAgentContent(agent.id, query);
        send({ agentId: agent.id, status: "done", content });
      });

      await Promise.all(agentPromises);

      // Signal stream end
      send({ type: "done" });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
