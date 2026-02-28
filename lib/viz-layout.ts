// Determines how many grid columns a visualization type should occupy.
// Wide charts (timelines, scatters, heatmaps, tables) get col-span-2;
// everything else gets col-span-1.

const WIDE_VIZ = new Set([
  "lineChart",     // growth trajectory — needs horizontal room
  "areaChart",     // adoption S-curve
  "stackedBar",    // multi-category segmentation
  "scatter",       // 2D effort/impact matrix
  "heatmap",       // competitor feature matrix
  "dataTable",     // financial table with multiple columns
  "barChartHoriz", // long feature names on the left axis
]);

export function getVizColSpan(vizHint: string): 1 | 2 {
  return WIDE_VIZ.has(vizHint) ? 2 : 1;
}
