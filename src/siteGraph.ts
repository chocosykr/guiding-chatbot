import graphData from './site-graph.json';

export interface TourEdge {
  to: string;
  selector: string;
  message?: string;
}

export interface TourNode {
  path?: string;
  label: string;
  keywords: string[];
  edges: TourEdge[];
  parent?: string;
}

export type SiteGraph = Record<string, TourNode>;

export const siteGraph: SiteGraph = graphData as SiteGraph;