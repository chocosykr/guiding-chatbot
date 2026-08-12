export interface TourEdge {
  to: string;
  selector: string;
}

export interface TourNode {
  path: string;
  label: string;
  keywords: string[];
  edges: TourEdge[];
}

export type SiteGraph = Record<string, TourNode>;

export const siteGraph: SiteGraph;
