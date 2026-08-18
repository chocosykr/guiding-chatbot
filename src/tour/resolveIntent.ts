import { siteGraph, type SiteGraph } from '../siteGraph';

export interface IntentResponse {
  action: 'navigate' | 'answer' | 'clarify';
  targetNodeId?: string | null;
  formId?: string | null;
  text?: string | null;
  startMessage?: string | null;
  completionMessage?: string | null;
}

const CHAIN_SPLIT_RE = /\s*(?:,?\s*and then\s+|,?\s*then\s+|\s+after that\s+)\s*/i;

function resolveSingleIntent(
  userMessage: string,
  currentNodeId: string,
  graph: SiteGraph,
): IntentResponse {
  const lowerQuery = userMessage.toLowerCase();

  if (
    (lowerQuery.includes('question') || lowerQuery.includes('set')) &&
    (lowerQuery.includes('new') || lowerQuery.includes('create') || lowerQuery.includes('add') || lowerQuery.includes('make') || lowerQuery.includes('start'))
  ) {
    return {
      action: 'navigate',
      targetNodeId: 'create-set',
      startMessage: "I'll guide you through creating a new question set. Follow the highlights!",
      completionMessage: "You're all set to build your question set!"
    };
  }

  if (lowerQuery.includes('import')) {
    return {
      action: 'navigate',
      targetNodeId: 'dashboard.dashboard-import-btn',
      startMessage: "I'll guide you to the Import Questions button on the Dashboard!",
      completionMessage: "Here is the Import Questions button!"
    };
  }

  const words = lowerQuery
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

  if (bestNode && bestScore > 2) {
    return {
      action: 'navigate',
      targetNodeId: bestNode,
      startMessage: `Heading over to ${graph[bestNode].label}. Follow the highlights!`,
      completionMessage: "We've arrived!"
    };
  }

  return {
    action: 'clarify',
    text: "I'm not quite sure what you mean. Try asking a question or mentioning a page name like 'dashboard'."
  };
}

export function resolveIntents(
  userMessage: string,
  currentNodeId: string,
  graph: SiteGraph = siteGraph,
): IntentResponse[] {
  const parts = userMessage.split(CHAIN_SPLIT_RE).map((p) => p.trim()).filter(Boolean);

  if (parts.length <= 1) {
    return [resolveSingleIntent(userMessage, currentNodeId, graph)];
  }

  let runningNodeId = currentNodeId;
  const results: IntentResponse[] = [];
  for (const part of parts) {
    const result = resolveSingleIntent(part, runningNodeId, graph);
    results.push(result);
    if (result.action === 'navigate' && result.targetNodeId) runningNodeId = result.targetNodeId;
  }
  return results;
}

export function resolveIntent(
  userMessage: string,
  currentNodeId: string,
  graph: SiteGraph = siteGraph,
): IntentResponse {
  return resolveSingleIntent(userMessage, currentNodeId, graph);
}