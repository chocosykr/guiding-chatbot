import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const appTsxPath = path.join(srcDir, 'App.tsx');
const graphEdgesPath = path.join(srcDir, 'graph-edges.json');
const outPath = path.join(srcDir, 'site-graph.json');

function humanize(str) {
  if (!str) return '';
  return str
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

function pathToId(routePath) {
  if (routePath === '/') return 'home';
  return routePath.replace(/^\//, '').replace(/\//g, '.');
}

function parseAppTsx() {
  const content = fs.readFileSync(appTsxPath, 'utf-8');

  const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"](.+?)['"]/g;
  const elementToFile = {};
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const elementName = match[1];
    let importPath = match[2];
    if (importPath.startsWith('./')) {
      const resolved = path.join(srcDir, importPath.slice(2));
      const fileWithExt = fs.existsSync(resolved + '.tsx') ? resolved + '.tsx' : resolved + '.ts';
      elementToFile[elementName] = fileWithExt;
    }
  }

  const routes = [];
  const lines = content.split('\n');
  const parentStack = [];

  for (const line of lines) {
    const trimmed = line.trim();

    const routeMatch = trimmed.match(/<Route\s+path=['"]([^'"]+)['"]\s+element=\{<([A-Za-z0-9_]+)\s*\/>\}\s*(\/?>)/);
    if (routeMatch) {
      const rawPath = routeMatch[1];
      const elementName = routeMatch[2];
      const closing = routeMatch[3];

      let absolutePath;
      if (rawPath.startsWith('/')) {
        absolutePath = rawPath;
      } else {
        const parentPath = parentStack.length > 0 ? parentStack[parentStack.length - 1] : '';
        absolutePath = `${parentPath}/${rawPath}`.replace('//', '/');
      }

      const id = pathToId(absolutePath);
      const labelSegment = absolutePath.split('/').pop();

      routes.push({
        id,
        path: absolutePath,
        element: elementName,
        file: elementToFile[elementName],
        label: absolutePath === '/' ? 'Home' : humanize(labelSegment),
      });

      if (closing === '>') {
        parentStack.push(absolutePath);
      }
      continue;
    }

    if (trimmed === '</Route>') {
      parentStack.pop();
      continue;
    }
  }

  return routes;
}

function findTourIds(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const tourIds = [];
  const regex = /(?:data-tour-id|tourId)=['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    tourIds.push(match[1]);
  }
  return tourIds;
}

function findKeywords(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = /export const keywords\s*=\s*\[(.*?)\];/s;
  const match = regex.exec(content);
  if (match) {
    return match[1].split(',')
      .map(s => s.trim().replace(/['"]/g, ''))
      .filter(Boolean);
  }
  return [];
}

function generateTree() {
  const routes = parseAppTsx();
  const tree = {};

  tree['nav-settings'] = {
    label: 'Settings Menu',
    selector: '[data-tour-id="nav-settings"]',
  };

  console.log('Discovered routes:');
  for (const route of routes) {
    console.log(`  ${route.id} -> ${route.path} (${route.element})`);
    const routeKeywords = findKeywords(route.file);
    tree[route.id] = {
      path: route.path,
      label: route.label,
      keywords: routeKeywords,
      parent: undefined,
    };

    const tourIds = findTourIds(route.file);
    for (const tourId of tourIds) {
      const childId = `${route.id}.${tourId}`;
      tree[childId] = {
        label: humanize(tourId),
        selector: `[data-tour-id="${tourId}"]`,
        parent: route.id,
      };
    }
  }

  return tree;
}

function loadManualEdges() {
  if (!fs.existsSync(graphEdgesPath)) {
    console.warn(`[generate-graph] No graph-edges.json found at ${graphEdgesPath} — skipping manual edges.`);
    return [];
  }
  return JSON.parse(fs.readFileSync(graphEdgesPath, 'utf-8'));
}

function buildGraph(tree, manualEdges) {
  const graph = {};

  for (const [id, node] of Object.entries(tree)) {
    graph[id] = {
      path: node.path,
      label: node.label,
      keywords: node.keywords || [],
      edges: [],
      parent: node.parent,
    };
  }

  if (graph['settings'] && graph['settings.profile']) {
    graph['settings'].edges.push({ to: 'settings.profile', selector: '' });
  }

  for (const [id, node] of Object.entries(tree)) {
    if (node.parent && graph[node.parent]) {
      graph[id].edges.push({ to: node.parent, selector: '' });
      graph[node.parent].edges.push({ to: id, selector: node.selector });
    }
  }

  for (const edge of manualEdges) {
    if (!graph[edge.from]) {
      console.warn(`[generate-graph] Warning: edge references non-existent 'from' node: ${edge.from}`);
      continue;
    }
    if (!graph[edge.to]) {
      console.warn(`[generate-graph] Warning: edge references non-existent 'to' node: ${edge.to}`);
    }
    graph[edge.from].edges.push({ to: edge.to, selector: edge.selector });
  }

  return graph;
}

function main() {
  const tree = generateTree();
  const manualEdges = loadManualEdges();
  const graph = buildGraph(tree, manualEdges);

  fs.writeFileSync(outPath, JSON.stringify(graph, null, 2), 'utf-8');
  console.log(`\nSuccessfully generated site graph (${Object.keys(graph).length} nodes) at ${outPath}`);
}

main();