import json
from pathlib import Path

GRAPH_PATH = Path(__file__).parent.parent / "src" / "site-graph.json"

def load_site_graph() -> dict:
    with open(GRAPH_PATH) as f:
        return json.load(f)

def node_exists(node_id: str) -> bool:
    return node_id in load_site_graph()