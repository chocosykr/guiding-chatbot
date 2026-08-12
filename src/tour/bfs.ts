import { siteGraph, type SiteGraph, type TourEdge } from '../siteGraph';

/**
 * bfsPath — finds the shortest path of edges from `startId` to `targetId`
 * in the site graph using breadth-first search.
 */
export function bfsPath(
  startId: string,
  targetId: string,
  graph: SiteGraph = siteGraph,
): TourEdge[] {
  if (startId === targetId) return [];

  const queue: [string, TourEdge[]][] = [[startId, []]];
  const visited = new Set<string>([startId]);

  while (queue.length > 0) {
    const [currentId, path] = queue.shift()!;
    const node = graph[currentId];
    if (!node) continue;

    for (const edge of node.edges) {
      if (visited.has(edge.to)) continue;
      visited.add(edge.to);

      const newPath = [...path, edge];
      if (edge.to === targetId) return newPath;
      queue.push([edge.to, newPath]);
    }
  }

  return [];
}
