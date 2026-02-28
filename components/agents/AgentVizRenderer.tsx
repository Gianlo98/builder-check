"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";
import { AgentConfig, AgentContent } from "@/lib/agents";
import { AgentCard } from "./agent-card";

const VizLoading = () => (
  <div className="flex items-center justify-center h-40">
    <Spinner className="h-6 w-6 text-muted-foreground" />
  </div>
);

const ScoreCardViz = dynamic(
  () => import("./visualizations/ScoreCardViz"),
  { ssr: false, loading: VizLoading }
);
const BarChartViz = dynamic(
  () => import("./visualizations/BarChartViz"),
  { ssr: false, loading: VizLoading }
);
const RadarChartViz = dynamic(
  () => import("./visualizations/RadarChartViz"),
  { ssr: false, loading: VizLoading }
);
const ProgressListViz = dynamic(
  () => import("./visualizations/ProgressListViz"),
  { ssr: false, loading: VizLoading }
);
const TitleCardViz = dynamic(
  () => import("./visualizations/TitleCardViz"),
  { ssr: false, loading: VizLoading }
);
const KpiCardViz = dynamic(
  () => import("./visualizations/KpiCardViz"),
  { ssr: false, loading: VizLoading }
);
const GaugeViz = dynamic(
  () => import("./visualizations/GaugeViz"),
  { ssr: false, loading: VizLoading }
);
const LineChartViz = dynamic(
  () => import("./visualizations/LineChartViz"),
  { ssr: false, loading: VizLoading }
);
const StackedBarViz = dynamic(
  () => import("./visualizations/StackedBarViz"),
  { ssr: false, loading: VizLoading }
);
const AreaChartViz = dynamic(
  () => import("./visualizations/AreaChartViz"),
  { ssr: false, loading: VizLoading }
);
const DistributionViz = dynamic(
  () => import("./visualizations/DistributionViz"),
  { ssr: false, loading: VizLoading }
);
const ScatterViz = dynamic(
  () => import("./visualizations/ScatterViz"),
  { ssr: false, loading: VizLoading }
);
const HeatmapViz = dynamic(
  () => import("./visualizations/HeatmapViz"),
  { ssr: false, loading: VizLoading }
);
const DonutViz = dynamic(
  () => import("./visualizations/DonutViz"),
  { ssr: false, loading: VizLoading }
);
const DataTableViz = dynamic(
  () => import("./visualizations/DataTableViz"),
  { ssr: false, loading: VizLoading }
);
const EntityListViz = dynamic(
  () => import("./visualizations/EntityListViz"),
  { ssr: false, loading: VizLoading }
);
const TimelineViz = dynamic(
  () => import("./visualizations/TimelineViz"),
  { ssr: false, loading: VizLoading }
);
const InsightCalloutViz = dynamic(
  () => import("./visualizations/InsightCalloutViz"),
  { ssr: false, loading: VizLoading }
);
const BarChartHorizViz = dynamic(
  () => import("./visualizations/BarChartHorizViz"),
  { ssr: false, loading: VizLoading }
);

interface Props {
  agent: AgentConfig;
  content: AgentContent;
}

export function AgentVizRenderer({ agent, content }: Props) {
  const viz = content.vizData;
  if (viz) {
    switch (viz.vizType) {
      case "scoreCard":
        return <ScoreCardViz agent={agent} data={viz} content={content} />;
      case "barChart":
        return <BarChartViz agent={agent} data={viz} content={content} />;
      case "radarChart":
        return <RadarChartViz agent={agent} data={viz} content={content} />;
      case "progressList":
        return <ProgressListViz agent={agent} data={viz} content={content} />;
      case "titleCard":
        return <TitleCardViz agent={agent} data={viz} content={content} />;
      case "kpiCard":
        return <KpiCardViz agent={agent} data={viz} content={content} />;
      case "gauge":
        return <GaugeViz agent={agent} data={viz} content={content} />;
      case "lineChart":
        return <LineChartViz agent={agent} data={viz} content={content} />;
      case "stackedBar":
        return <StackedBarViz agent={agent} data={viz} content={content} />;
      case "areaChart":
        return <AreaChartViz agent={agent} data={viz} content={content} />;
      case "distribution":
        return <DistributionViz agent={agent} data={viz} content={content} />;
      case "scatter":
        return <ScatterViz agent={agent} data={viz} content={content} />;
      case "heatmap":
        return <HeatmapViz agent={agent} data={viz} content={content} />;
      case "donut":
        return <DonutViz agent={agent} data={viz} content={content} />;
      case "dataTable":
        return <DataTableViz agent={agent} data={viz} content={content} />;
      case "entityList":
        return <EntityListViz agent={agent} data={viz} content={content} />;
      case "timeline":
        return <TimelineViz agent={agent} data={viz} content={content} />;
      case "insightCallout":
        return <InsightCalloutViz agent={agent} data={viz} content={content} />;
      case "barChartHoriz":
        return <BarChartHorizViz agent={agent} data={viz} content={content} />;
    }
  }

  // Fallback to existing structured card
  return <AgentCard agent={agent} content={content} />;
}
