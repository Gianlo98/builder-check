import { NextRequest } from "next/server";
import { AGENTS, AgentContent } from "@/lib/agents";

// ---------------------------------------------------------------------------
// Mock AI responses — each agent returns vizData matching its vizHint so the
// correct visualization component is rendered in the UI.
// ---------------------------------------------------------------------------

function generateAgentContent(agentId: string, _query: string): AgentContent {
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
      ],
      tags: ["High Growth", "Fragmented", "AI Tailwind"],
      recommendation:
        "Strong timing. Enter now to establish category position before consolidation.",
      vizData: {
        vizType: "scoreCard",
        title: "Market Opportunity",
        score: 78,
        scoreLabel: "Market Score",
        items: [
          { label: "TAM Size", value: 85, max: 100, sentiment: "positive" },
          { label: "Growth Rate", value: 80, max: 100, sentiment: "positive" },
          { label: "Timing", value: 75, max: 100, sentiment: "positive" },
          { label: "Fragmentation", value: 70, max: 100, sentiment: "neutral" },
        ],
        recommendation: "Enter now before consolidation.",
      },
    },

    competition: {
      summary:
        "The competitive field has incumbents but no dominant player has locked in the specific niche.",
      score: 65,
      scoreLabel: "Differentiation Score",
      bullets: [
        "3–4 direct competitors with $5M–$50M ARR — none at escape velocity",
        "Key moat opportunity: proprietary data flywheel + network effects",
        "12–18 month window to differentiate before VC-funded rivals scale",
      ],
      tags: ["Differentiation Possible", "VC Backed Rivals", "Niche Open"],
      recommendation: "Win on depth and vertical focus.",
      vizData: {
        vizType: "radarChart",
        title: "Competitive Positioning",
        score: 65,
        scoreLabel: "Differentiation Score",
        axes: [
          { axis: "Product Depth", value: 80, fullMark: 100 },
          { axis: "Distribution", value: 55, fullMark: 100 },
          { axis: "Brand", value: 45, fullMark: 100 },
          { axis: "Data Moat", value: 70, fullMark: 100 },
          { axis: "Pricing", value: 65, fullMark: 100 },
          { axis: "Integrations", value: 60, fullMark: 100 },
        ],
        recommendation: "Focus on product depth and data moat.",
      },
    },

    customer: {
      summary:
        "Clear ICP exists with identifiable pain, budget authority, and urgency to act.",
      score: 82,
      scoreLabel: "Customer Fit Score",
      bullets: [
        "Primary ICP: mid-market ops and product teams (50–500 employees)",
        "Budget range $500–$2,000/mo per team — within discretionary spend",
        "Champions are mid-level ICs; economic buyer is VP-level",
      ],
      tags: ["Defined ICP", "Recurring Pain", "Budget Confirmed"],
      recommendation: "Start with bottoms-up PLG motion targeting ICs.",
      vizData: {
        vizType: "progressList",
        title: "ICP Fit Signals",
        score: 82,
        scoreLabel: "Customer Fit Score",
        items: [
          { label: "Pain Frequency", value: 90, max: 100, sentiment: "positive" },
          { label: "Budget Availability", value: 80, max: 100, sentiment: "positive" },
          { label: "Decision Speed", value: 75, max: 100, sentiment: "positive" },
          { label: "Switching Cost", value: 55, max: 100, sentiment: "neutral" },
          { label: "Champion Access", value: 85, max: 100, sentiment: "positive" },
        ],
        recommendation: "Target mid-market ops teams first.",
      },
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
      ],
      tags: ["SaaS", "Land & Expand", "High Margin"],
      recommendation: "Launch with a usage-based free tier.",
      vizData: {
        vizType: "barChart",
        title: "Revenue Model Metrics",
        score: 74,
        scoreLabel: "Model Viability Score",
        bars: [
          { name: "Gross Margin", value: 76 },
          { name: "NRR", value: 118 },
          { name: "CAC Payback", value: 68 },
          { name: "LTV/CAC", value: 85 },
          { name: "Expansion Rev", value: 72 },
        ],
        recommendation: "Optimize for expansion revenue early.",
      },
    },

    risks: {
      summary:
        "Primary risks are execution-speed and distribution, not market or technical validity.",
      score: 58,
      scoreLabel: "Risk-Adjusted Score",
      bullets: [
        "Execution risk: thin founding team in sales/go-to-market function",
        "Copycat risk: well-funded competitor could replicate MVP in 3–4 months",
        "Regulatory: GDPR/SOC2 compliance required before enterprise deals",
      ],
      tags: ["Execution Risk", "Moderate Risk", "Mitigatable"],
      recommendation: "Hire a sales/growth co-founder early.",
      vizData: {
        vizType: "gauge",
        title: "Risk Assessment",
        score: 58,
        scoreLabel: "Risk-Adjusted Score",
        sublabel: "Moderate risk — execution is primary concern",
        recommendation: "Hire a sales co-founder. Build data lock-in in Month 1.",
      },
    },

    gtm: {
      summary:
        "PLG-led motion with community and content amplification is the optimal launch path.",
      score: 71,
      scoreLabel: "GTM Readiness Score",
      bullets: [
        "Channel 1: Bottom-up PLG — free tier targeted at indie users",
        "Channel 2: Founder-led content on LinkedIn/Twitter",
        "Channel 3: Integration partnerships with tools in existing workflow",
      ],
      tags: ["PLG", "Content-Led", "Community"],
      recommendation: "First 90 days: 50 design partners, 500 waitlist, 1 anchor integration.",
      vizData: {
        vizType: "timeline",
        title: "Go-to-Market Roadmap",
        score: 71,
        scoreLabel: "GTM Readiness Score",
        events: [
          { date: "Month 1–2", label: "Design Partner Program", description: "Recruit 50 design partners; validate core workflow", sentiment: "positive" },
          { date: "Month 3", label: "Public Beta Launch", description: "Launch free tier; activate PLG flywheel", sentiment: "positive" },
          { date: "Month 4–5", label: "Content & Community", description: "Founder-led content; join 10 niche communities", sentiment: "neutral" },
          { date: "Month 6", label: "First Paid Tier", description: "Convert top design partners; target $10K MRR", sentiment: "positive" },
          { date: "Month 9", label: "Integration Partnerships", description: "Ship Notion + Slack integrations; unlock new segment", sentiment: "positive" },
        ],
        recommendation: "Move fast on design partners — they become first paid customers.",
      },
    },

    product: {
      summary:
        "Core product hypothesis is tight and differentiated. MVP scope is achievable in 8–10 weeks.",
      score: 80,
      scoreLabel: "Product-Market Fit Signal",
      bullets: [
        "Value prop is single-sentence clear: solves one painful workflow completely",
        "Core feature set maps directly to ICP's weekly pain points",
        "Integration surface is manageable — 2 anchor integrations sufficient for v1",
      ],
      tags: ["Clear Value Prop", "MVP Scoped", "Integration Ready"],
      recommendation: "Ship narrow and deep. Resist feature creep in first 6 months.",
      vizData: {
        vizType: "titleCard",
        title: "Venture Snapshot",
        description:
          "A focused B2B SaaS product solving a high-frequency workflow pain for mid-market teams. Strong PMF signals, clear ICP, and achievable MVP scope within a 10-week build cycle.",
        tags: ["B2B SaaS", "PLG Motion", "Mid-Market", "AI-Powered"],
        badge: "Strong Signal",
        score: 80,
        scoreLabel: "PMF Signal",
        recommendation: "Ship narrow and deep. Resist scope creep.",
      },
    },

    unit_economics: {
      summary:
        "Unit economics are healthy at target ACV. Payback under 12 months is achievable from Month 6.",
      score: 72,
      scoreLabel: "Economics Score",
      bullets: [
        "Target ACV $18K–$24K for team plans; CAC estimated $3K–$5K via PLG",
        "LTV/CAC ratio of 4–6x achievable by Month 18 with current churn assumptions",
        "Gross margin floor 72% even with AWS costs at 3x current estimates",
      ],
      tags: ["Healthy LTV/CAC", "Under-12mo Payback", "High Margin"],
      recommendation: "Keep CAC low via PLG; only add outbound when LTV/CAC > 5x.",
      vizData: {
        vizType: "kpiCard",
        title: "Unit Economics",
        score: 72,
        scoreLabel: "Economics Score",
        metrics: [
          { label: "Target ACV", value: "$21K", delta: "+18% YoY", deltaDirection: "up" },
          { label: "Est. CAC", value: "$4,200", delta: "-12% w/ PLG", deltaDirection: "up" },
          { label: "LTV/CAC", value: "4.8×", delta: "+0.6× from v1", deltaDirection: "up" },
          { label: "Gross Margin", value: "74%", delta: "Stable", deltaDirection: "neutral" },
          { label: "Payback Period", value: "9.6 mo", delta: "-2.4 mo", deltaDirection: "up" },
          { label: "NRR (target)", value: "118%", delta: "+8% expansion", deltaDirection: "up" },
        ],
        recommendation: "Optimize CAC first; raise ACV after retention is proven.",
      },
    },

    growth: {
      summary:
        "Conservative model shows $1M ARR by Month 14; aggressive model reaches it by Month 10.",
      score: 68,
      scoreLabel: "Growth Confidence Score",
      bullets: [
        "Base case: 15% MoM user growth, 8% conversion to paid",
        "$1M ARR milestone requires ~55 team accounts at $18K ACV",
        "Biggest growth lever is NRR — focus on expansion features from Month 4",
      ],
      tags: ["$1M ARR Target", "Month 10–14", "NRR-Driven"],
      recommendation: "Build expansion features early — NRR is the multiplier.",
      vizData: {
        vizType: "lineChart",
        title: "ARR Growth Projection",
        score: 68,
        scoreLabel: "Growth Confidence Score",
        xLabel: "Month",
        yLabel: "ARR ($K)",
        lines: [
          {
            name: "Conservative",
            data: [
              { x: "M1", y: 0 }, { x: "M3", y: 15 }, { x: "M6", y: 80 },
              { x: "M9", y: 280 }, { x: "M12", y: 650 }, { x: "M14", y: 1000 },
            ],
          },
          {
            name: "Aggressive",
            data: [
              { x: "M1", y: 0 }, { x: "M3", y: 40 }, { x: "M6", y: 180 },
              { x: "M9", y: 520 }, { x: "M10", y: 1000 }, { x: "M12", y: 1600 },
            ],
          },
        ],
        recommendation: "Track MoM growth rate weekly; adjust spend if below 12%.",
      },
    },

    segments: {
      summary:
        "Three primary segments addressable in year one; enterprise segment unlocks in year two.",
      score: 66,
      scoreLabel: "Segmentation Clarity Score",
      bullets: [
        "Segment A (SMB): highest volume, lowest ACV — use as PLG acquisition layer",
        "Segment B (Mid-Market): sweet spot; highest LTV/CAC ratio",
        "Segment C (Enterprise): longest sales cycle but 5× ACV; defer to Year 2",
      ],
      tags: ["3 Segments", "Mid-Market Sweet Spot", "PLG Entry"],
      recommendation: "Sequence: SMB → Mid-Market → Enterprise over 24 months.",
      vizData: {
        vizType: "stackedBar",
        title: "Market Segmentation by Revenue Potential",
        score: 66,
        scoreLabel: "Segmentation Clarity Score",
        categories: ["Year 1", "Year 2", "Year 3"],
        bars: [
          {
            name: "SMB",
            segments: [
              { label: "Year 1", value: 120 },
              { label: "Year 2", value: 200 },
              { label: "Year 3", value: 280 },
            ],
          },
          {
            name: "Mid-Market",
            segments: [
              { label: "Year 1", value: 80 },
              { label: "Year 2", value: 350 },
              { label: "Year 3", value: 700 },
            ],
          },
          {
            name: "Enterprise",
            segments: [
              { label: "Year 1", value: 0 },
              { label: "Year 2", value: 150 },
              { label: "Year 3", value: 600 },
            ],
          },
        ],
        recommendation: "Don't chase enterprise in year one — it'll dilute focus.",
      },
    },

    adoption: {
      summary:
        "Adoption S-curve is well-defined. Early majority phase begins around Month 18 if execution holds.",
      score: 64,
      scoreLabel: "Adoption Curve Score",
      bullets: [
        "Innovators + Early Adopters: 5–10% of TAM, targeted via design partners",
        "Early Majority unlock requires 2–3 visible customer case studies",
        "Crossing the chasm risk: B2B workflow tools often stall at ~500 accounts",
      ],
      tags: ["S-Curve Model", "Chasm Risk Noted", "Case Study Dependent"],
      recommendation: "Publish 3 named case studies before scaling marketing spend.",
      vizData: {
        vizType: "areaChart",
        title: "Adoption Curve Over Time",
        score: 64,
        scoreLabel: "Adoption Curve Score",
        xLabel: "Month",
        areas: [
          {
            name: "Innovators",
            data: [
              { x: "M1", y: 12 }, { x: "M3", y: 45 }, { x: "M6", y: 80 },
              { x: "M9", y: 95 }, { x: "M12", y: 100 },
            ],
          },
          {
            name: "Early Adopters",
            data: [
              { x: "M1", y: 0 }, { x: "M3", y: 20 }, { x: "M6", y: 120 },
              { x: "M9", y: 280 }, { x: "M12", y: 420 },
            ],
          },
          {
            name: "Early Majority",
            data: [
              { x: "M1", y: 0 }, { x: "M3", y: 0 }, { x: "M6", y: 15 },
              { x: "M9", y: 80 }, { x: "M12", y: 250 },
            ],
          },
        ],
        recommendation: "Prioritize case studies to accelerate early majority crossing.",
      },
    },

    pricing: {
      summary:
        "Price point distribution analysis shows the $99–$199/seat/mo band has the highest conversion density.",
      score: 70,
      scoreLabel: "Pricing Confidence Score",
      bullets: [
        "Competitors cluster in the $49–$149 range; there is white space above $200",
        "Willingness-to-pay research suggests $129/seat/mo is the optimal anchor",
        "Usage-based freemium at 0 drives top-of-funnel; gate collaboration features",
      ],
      tags: ["$129 Sweet Spot", "Freemium Entry", "Value-Based"],
      recommendation: "Launch at $129/seat; test $199 for power-user tier.",
      vizData: {
        vizType: "distribution",
        title: "Competitor Price Point Distribution",
        score: 70,
        scoreLabel: "Pricing Confidence Score",
        xLabel: "Price per Seat / Month",
        bins: [
          { range: "$0–49", count: 8 },
          { range: "$50–99", count: 14 },
          { range: "$100–149", count: 11 },
          { range: "$150–199", count: 6 },
          { range: "$200–249", count: 3 },
          { range: "$250+", count: 2 },
        ],
        recommendation: "Price at $129 to capture the highest-density band.",
      },
    },

    features: {
      summary:
        "Feature prioritization analysis reveals 3 must-haves for MVP and 5 high-value quick wins.",
      score: 75,
      scoreLabel: "Feature Clarity Score",
      bullets: [
        "Core workflow automation is the #1 value driver — non-negotiable for v1",
        "Integrations (Slack, Notion) unlock the most adjacent users with least dev effort",
        "AI suggestions layer adds perceived value but is not blocking adoption",
      ],
      tags: ["MVP Defined", "3 Core Features", "AI Enhancement"],
      recommendation: "Ship the 3 must-haves first; add AI layer in v1.1.",
      vizData: {
        vizType: "barChartHoriz",
        title: "Feature Value vs. Effort Score",
        score: 75,
        scoreLabel: "Feature Clarity Score",
        bars: [
          { name: "Core Workflow Automation", value: 95 },
          { name: "Slack Integration", value: 82 },
          { name: "Notion Integration", value: 78 },
          { name: "Team Collaboration", value: 74 },
          { name: "AI Suggestions", value: 68 },
          { name: "Analytics Dashboard", value: 62 },
          { name: "Mobile App", value: 45 },
          { name: "API Access", value: 58 },
        ],
        recommendation: "Build top 4 for MVP; AI and analytics in v1.1.",
      },
    },

    competitive_matrix: {
      summary:
        "Feature coverage matrix shows clear gaps in incumbent offerings that represent your strongest entry points.",
      score: 62,
      scoreLabel: "Positioning Score",
      bullets: [
        "Incumbents A and B both weak on AI-native workflows — your primary wedge",
        "No competitor offers deep Slack-native experience — available moat",
        "Analytics gap across all competitors except Incumbent C (enterprise only)",
      ],
      tags: ["Clear Gaps", "AI Wedge", "Slack Native Moat"],
      recommendation: "Lead with AI + Slack-native story. Both are defensible.",
      vizData: {
        vizType: "heatmap",
        title: "Competitive Feature Matrix",
        score: 62,
        scoreLabel: "Positioning Score",
        rows: ["Incumbent A", "Incumbent B", "Incumbent C", "Your Product"],
        cols: ["AI Workflows", "Slack Native", "Analytics", "Integrations", "Mobile"],
        cells: [
          { row: "Incumbent A", col: "AI Workflows", value: 30 },
          { row: "Incumbent A", col: "Slack Native", value: 40 },
          { row: "Incumbent A", col: "Analytics", value: 70 },
          { row: "Incumbent A", col: "Integrations", value: 80 },
          { row: "Incumbent A", col: "Mobile", value: 60 },
          { row: "Incumbent B", col: "AI Workflows", value: 25 },
          { row: "Incumbent B", col: "Slack Native", value: 35 },
          { row: "Incumbent B", col: "Analytics", value: 55 },
          { row: "Incumbent B", col: "Integrations", value: 65 },
          { row: "Incumbent B", col: "Mobile", value: 75 },
          { row: "Incumbent C", col: "AI Workflows", value: 50 },
          { row: "Incumbent C", col: "Slack Native", value: 45 },
          { row: "Incumbent C", col: "Analytics", value: 85 },
          { row: "Incumbent C", col: "Integrations", value: 90 },
          { row: "Incumbent C", col: "Mobile", value: 70 },
          { row: "Your Product", col: "AI Workflows", value: 90 },
          { row: "Your Product", col: "Slack Native", value: 85 },
          { row: "Your Product", col: "Analytics", value: 60 },
          { row: "Your Product", col: "Integrations", value: 70 },
          { row: "Your Product", col: "Mobile", value: 40 },
        ],
        recommendation: "Double down on AI + Slack — that's your differentiation.",
      },
    },

    channels: {
      summary:
        "Organic and product-led channels dominate the optimal mix; paid acquisition should wait until Month 9.",
      score: 73,
      scoreLabel: "Channel Confidence Score",
      bullets: [
        "Product-led (free tier + viral loops) should drive 45% of early acquisition",
        "Content marketing and SEO deliver best CAC payback at 8× average",
        "Paid social only becomes efficient after strong organic baseline is built",
      ],
      tags: ["PLG 45%", "Content-Led", "Paid Deferred"],
      recommendation: "Defer paid channels until MoM organic growth drops below 10%.",
      vizData: {
        vizType: "donut",
        title: "Acquisition Channel Mix",
        score: 73,
        scoreLabel: "Channel Confidence Score",
        slices: [
          { name: "Product-Led Growth", value: 45 },
          { name: "Content / SEO", value: 25 },
          { name: "Community", value: 15 },
          { name: "Partnerships", value: 10 },
          { name: "Paid Social", value: 5 },
        ],
        recommendation: "Invest in PLG loops and content before any paid spend.",
      },
    },

    financials: {
      summary:
        "3-year financial model shows path to profitability by Month 28 under conservative assumptions.",
      score: 67,
      scoreLabel: "Financial Confidence Score",
      bullets: [
        "Year 1: $0.4M ARR, -$0.8M net (seed runway required)",
        "Year 2: $1.8M ARR, -$0.3M net (Series A closes gap)",
        "Year 3: $5.2M ARR, +$0.6M net (first profitable year)",
      ],
      tags: ["Break-even Y3", "Seed → Series A", "Lean Burn"],
      recommendation: "Raise $1.5M seed. Focus on ARR milestones to trigger Series A.",
      vizData: {
        vizType: "dataTable",
        title: "3-Year Financial Projections",
        score: 67,
        scoreLabel: "Financial Confidence Score",
        columns: ["Metric", "Year 1", "Year 2", "Year 3"],
        rows: [
          { cells: ["ARR", "$420K", "$1.8M", "$5.2M"] },
          { cells: ["MRR (EoY)", "$35K", "$150K", "$435K"] },
          { cells: ["Customers", "28", "110", "310"] },
          { cells: ["Gross Margin", "72%", "76%", "79%"] },
          { cells: ["Burn Rate / mo", "$68K", "$52K", "-$50K"] },
          { cells: ["Headcount", "4", "11", "22"] },
          { cells: ["Net Income", "-$816K", "-$312K", "+$600K"] },
        ],
        recommendation: "Keep headcount lean in Y1. Hire sales only after $500K ARR.",
      },
    },

    stakeholders: {
      summary:
        "Key stakeholder map identifies 2 champion profiles and 1 blocker persona that must be addressed early.",
      score: 69,
      scoreLabel: "Stakeholder Clarity Score",
      bullets: [
        "Champion A: mid-level IC who feels the daily pain — primary user and internal advocate",
        "Economic buyer: VP/Director — approves budget but delegates evaluation",
        "IT/Security: potential blocker on SOC2 compliance — engage early",
      ],
      tags: ["Champion Identified", "VP Budget", "IT Blocker Risk"],
      recommendation: "Build IT-friendly compliance docs before first enterprise demo.",
      vizData: {
        vizType: "entityList",
        title: "Key Stakeholders",
        score: 69,
        scoreLabel: "Stakeholder Clarity Score",
        entities: [
          { name: "Operations Manager", role: "Primary Champion", badge: "Day-1 User", sentiment: "positive" },
          { name: "VP Product / Ops", role: "Economic Buyer", badge: "Budget Owner", sentiment: "positive" },
          { name: "IT / Security Lead", role: "Compliance Gatekeeper", badge: "Blocker Risk", sentiment: "negative" },
          { name: "External Investors", role: "Series A Target", badge: "Follow Growth", sentiment: "neutral" },
          { name: "Integration Partners", role: "Distribution Lever", badge: "Slack / Notion", sentiment: "positive" },
        ],
        recommendation: "Arm champion with business case deck for VP sign-off.",
      },
    },

    effort_impact: {
      summary:
        "Effort/impact mapping surfaces 4 high-leverage quick wins and 2 strategic bets requiring longer investment.",
      score: 76,
      scoreLabel: "Prioritization Clarity Score",
      bullets: [
        "Top-right quadrant (high impact, low effort): PLG onboarding, Slack integration",
        "Strategic bets (high impact, high effort): AI engine, enterprise compliance",
        "Avoid bottom quadrants: mobile app and custom reporting are low-ROI for v1",
      ],
      tags: ["4 Quick Wins", "2 Bets", "Clear De-prioritization"],
      recommendation: "Execute all quick wins in sprint 1; schedule bets for Q2.",
      vizData: {
        vizType: "scatter",
        title: "Effort vs. Impact Matrix",
        score: 76,
        scoreLabel: "Prioritization Clarity Score",
        xLabel: "Implementation Effort",
        yLabel: "Business Impact",
        points: [
          { x: 20, y: 90, label: "PLG Onboarding" },
          { x: 25, y: 85, label: "Slack Integration" },
          { x: 40, y: 80, label: "Core Automation" },
          { x: 35, y: 75, label: "Notion Integration" },
          { x: 70, y: 88, label: "AI Engine" },
          { x: 80, y: 78, label: "Enterprise SSO" },
          { x: 50, y: 55, label: "Analytics Dashboard" },
          { x: 60, y: 45, label: "Custom Reports" },
          { x: 75, y: 35, label: "Mobile App" },
          { x: 30, y: 40, label: "Email Digest" },
        ],
        recommendation: "Start with top-left cluster; defer bottom-right.",
      },
    },

    key_insight: {
      summary:
        "The single most important finding: distribution is the moat, not the product. Your biggest risk is not building — it's getting found.",
      score: 85,
      scoreLabel: "Insight Confidence Score",
      bullets: [
        "Product differentiation is necessary but not sufficient in this category",
        "The winner will own a distribution channel — PLG, community, or a key integration",
        "Prioritizing distribution in Month 1 changes the entire growth trajectory",
      ],
      tags: ["Distribution Moat", "Critical Finding", "Action Required"],
      recommendation: "Treat distribution as a product feature, not an afterthought.",
      vizData: {
        vizType: "insightCallout",
        title: "Critical Insight",
        insight:
          "Distribution is the moat. In this category, the winner will not be the best product — it will be the one that owns a distribution channel. Your go-to-market strategy is as important as your core feature set.",
        sentiment: "positive",
        supportingPoints: [
          "3 of 4 category leaders won via a dominant acquisition channel, not product superiority",
          "PLG + one anchor integration can deliver CAC < $800 vs. $4K+ for outbound",
          "Founders who ship distribution features in Month 1 reach $1M ARR 40% faster",
        ],
        score: 85,
        scoreLabel: "Insight Confidence Score",
        recommendation: "Build your distribution flywheel on day one.",
      },
    },
  };

  return (
    mocks[agentId] ?? {
      summary: `Analysis complete for: ${_query}`,
      bullets: ["Key insight 1", "Key insight 2", "Key insight 3"],
      tags: ["Analyzed"],
    }
  );
}

// Simulated per-agent latencies (ms) to mimic parallel AI calls
const AGENT_DELAYS: Record<string, number> = {
  market: 1800,
  competition: 2600,
  customer: 1500,
  business_model: 2200,
  risks: 2900,
  gtm: 2100,
  product: 1200,
  unit_economics: 3000,
  growth: 2400,
  segments: 2700,
  adoption: 3200,
  pricing: 1900,
  features: 2300,
  competitive_matrix: 3500,
  channels: 1700,
  financials: 3800,
  stakeholders: 2500,
  effort_impact: 2000,
  key_insight: 4000,
};

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || typeof query !== "string" || query.trim().length < 5) {
    return new Response(JSON.stringify({ error: "Query too short" }), {
      status: 400,
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      for (const agent of AGENTS) {
        send({ agentId: agent.id, status: "loading" });
      }

      const agentPromises = AGENTS.map(async (agent) => {
        const delay = AGENT_DELAYS[agent.id] ?? 2500;
        await new Promise((resolve) => setTimeout(resolve, delay));
        const content = generateAgentContent(agent.id, query);
        send({ agentId: agent.id, status: "done", content });
      });

      await Promise.all(agentPromises);
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
