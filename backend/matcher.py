import re
from difflib import SequenceMatcher

STOP_WORDS = {
    'i', 'a', 'an', 'the', 'is', 'are', 'am', 'be', 'to', 'can', 'how',
    'do', 'does', 'where', 'my', 'me', 'you', 'it', 'in', 'on', 'at',
    'for', 'of', 'with', 'by', 'from', 'this', 'that', 'there', 'what'
}

GENERIC_WORDS = {'settings', 'page', 'portal', 'section', 'view', 'manage', 'show'}

def _tokenize(text: str) -> list[str]:
    words = re.split(r'\s+', text.lower().strip())
    cleaned = [re.sub(r'[^a-z0-9]', '', w) for w in words if w]
    return [w for w in cleaned if w and w not in STOP_WORDS]

def find_best_match(user_message: str, current_node_id: str, graph: dict) -> tuple[str | None, float]:
    words = _tokenize(user_message)
    if not words:
        return (None, 0)

    best_node = None
    best_score = 0.0

    for node_id, node in graph.items():
        if node_id == current_node_id:
            continue

        label_words = [w.lower() for w in re.split(r'\s+', node.get("label", ""))]
        keywords = [k.lower() for k in node.get("keywords", [])]
        match_pool = label_words + keywords

        score = 0.0
        for word in words:
            weight = 1.0 if word in GENERIC_WORDS else 4.0
            for match in match_pool:
                if match == word:
                    score += weight
                elif match and len(word) >= 3 and len(match) >= 3:
                    if match in word or word in match:
                        score += weight * 0.5
                    elif SequenceMatcher(None, word, match).ratio() >= 0.75:
                        score += weight * 0.75

        # Specificity bonus: a sub-element (button/field) that matches at all is
        # usually a more precise hit than its parent page matching the same words
        if node.get("parent") and score > 0:
            score += 1.0

        if score > best_score:
            best_score = score
            best_node = node_id

    return (best_node, best_score) if best_score > 2.0 else (None, 0)