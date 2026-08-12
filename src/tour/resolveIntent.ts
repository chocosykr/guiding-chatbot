import { siteGraph, type SiteGraph } from '../siteGraph';

/**
 * resolveIntent — maps a free-text user message to the best-matching site node.
 *
 * This is a simple keyword-matching stub. It scores each node by checking how
 * many of the user's words match the node's label and keywords.
 *
 * // TODO: replace with real LLM API call
 * A future implementation would send { userMessage, currentNodeId, siteGraph }
 * to an LLM endpoint and receive back a target node ID. The function signature
 * is designed to stay the same so the swap is a drop-in.
 */
export function resolveIntent(
  userMessage: string,
  currentNodeId: string,
  graph: SiteGraph = siteGraph,
): string | null {
  const words = userMessage
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);

  let bestNode: string | null = null;
  let bestScore = 0;

  for (const [nodeId, node] of Object.entries(graph)) {
    if (nodeId === currentNodeId) continue;

    const labelWords = node.label.toLowerCase().split(/\s+/);
    const keywords = node.keywords.map((k) => k.toLowerCase());
    const matchPool = [...labelWords, ...keywords];

    let score = 0;
    for (const word of words) {
      for (const match of matchPool) {
        if (match === word) score += 2;
        else if (match.includes(word) || word.includes(match)) score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestNode = nodeId;
    }
  }

  return bestScore > 0 ? bestNode : null;
}
