import os
import json
import re
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import IntentRequest, IntentResponse, Command
from graph import load_site_graph, node_exists
from site_context import SITE_CONTEXT, SYSTEM_PROMPT
from matcher import find_best_match

load_dotenv()
GROQ_API_KEY = os.environ.get("GROK_API_KEY")
RESOLVER_MODE = os.environ.get("RESOLVER_MODE", "llm")  # "llm" or "hybrid"

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])

client: httpx.AsyncClient

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = httpx.AsyncClient(timeout=15.0)
    yield
    await client.aclose()

app.router.lifespan_context = lifespan


def get_all_elements_by_page(graph: dict) -> str:
    """List every highlightable sub-element in the graph, grouped by parent page."""
    by_parent: dict[str, list[str]] = {}
    for node_id, node in graph.items():
        parent = node.get("parent")
        if parent:
            by_parent.setdefault(parent, []).append(f'  - "{node["label"]}" (id: {node_id})')

    lines = []
    for page_id, elements in by_parent.items():
        page_label = graph.get(page_id, {}).get("label", page_id)
        lines.append(f'On "{page_label}" (page id: {page_id}):')
        lines.extend(elements)
    return "\n".join(lines) if lines else "(none)"


def extract_json_object(text: str) -> str:
    """Grab the substring between the first { and last } — robust against
    reasoning text or prose the model adds before/after the JSON, not just
    markdown fences."""
    start = text.find('{')
    end = text.rfind('}')
    if start == -1 or end == -1 or end < start:
        raise ValueError("No JSON object found in response")
    return text[start:end + 1]


@app.post("/api/resolve-intent", response_model=IntentResponse)
async def resolve_intent(req: IntentRequest):
    site_graph = load_site_graph()
    all_elements = get_all_elements_by_page(site_graph)

    user_prompt = f"""Site Context: {SITE_CONTEXT}
Current Node ID: {req.currentNodeId}
All highlightable elements across the site, grouped by page:
{all_elements}
Recent Chat History:
{req.chatHistory or 'None'}

User Request: {req.userMessage}"""

    print("[fastapi-intent] calling Groq...")

    try:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={
                "model": "openai/gpt-oss-120b",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
            },
        )
    except httpx.TimeoutException:
        return IntentResponse(commands=[Command(action="clarify", text="That took too long — mind trying again?")])

    print(f"[fastapi-intent] Groq responded: {resp.status_code}")

    if resp.status_code != 200:
        print(f"[fastapi-intent] Error: {resp.text}")
        return IntentResponse(commands=[Command(action="clarify", text="Something went wrong on my end — try again in a moment.")])

    text_content = resp.json()["choices"][0]["message"]["content"]
    print(f"[fastapi-intent] raw LLM output: {text_content}")
    with open("llm_output_debug.log", "w") as f:
        f.write(text_content)

    try:
        clean = extract_json_object(text_content)
    except ValueError as e:
        print(f"[fastapi-intent] No JSON found: {e}")
        clean = text_content  # will fail json.loads below, handled by the except block
    print(f"[fastapi-intent] cleaned output: {clean}")

    try:
        raw = json.loads(clean)
        commands = [Command(**c) for c in raw.get("commands", [])]
    except Exception as e:
        print(f"[fastapi-intent] JSON parse error: {e}")
        print(f"[fastapi-intent] Cleaned text was: {repr(clean)}")
        commands = [Command(action="clarify", text="I didn't quite understand that. Could you rephrase?")]

    if not commands:
        commands = [Command(action="clarify", text="I didn't quite understand that. Could you rephrase?")]

    for cmd in commands:
        if cmd.action == "navigate" and cmd.targetNodeId and not node_exists(cmd.targetNodeId):
            cmd.action = "clarify"
            cmd.text = "I'm not sure which specific part of the site you mean. Could you clarify?"

   # Hybrid mode: only safe to override a single, standalone navigate command —
    # the matcher has no notion of chaining, so re-matching every command against
    # the same raw message would collapse a multi-step chain onto one target.
    if RESOLVER_MODE == "hybrid" and len(commands) == 1 and commands[0].action == "navigate":
        matched_id, score = find_best_match(req.userMessage, req.currentNodeId, site_graph)
        print(f"[matcher] '{req.userMessage}' -> {matched_id} (score={score})")
        if matched_id:
            commands[0].targetNodeId = matched_id
        elif not commands[0].targetNodeId:
            commands[0].action = "clarify"
            commands[0].text = "I'm not sure which specific part of the site you mean. Could you clarify?"

    return IntentResponse(commands=commands)