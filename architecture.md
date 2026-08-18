# Sailor Skill — Architecture & Flow Guide

> **Who is this for?** Anyone who has never seen this project before. By the end you
> should understand what the app does, how the pieces fit together, and what happens
> when a user types a message into the chat widget.

---

## 1. What is this project?

**Sailor Skill** is a web app for maritime training teams. Instructors and administrators
use it to:

- **Manage question sets** — create them (on the Create Set page), review individual
  questions (Question Review), and see them all on the Dashboard.
- **Manage offices** and **client companies** (simple CRUD tables).
- **Configure settings** — how many marks each question difficulty is worth, time limits
  per question type, and pass-percentage thresholds per rank.

But the *core* of the project is its **AI tour guide**: a chat widget (bottom-right corner)
that understands natural language ("take me to the import button") and then **guides the
user through the app by highlighting elements on screen**, step by step, until they reach
what they asked for.

In short: it's a normal admin CRUD app **plus** a chatbot that can walk people through it.

---

## 2. Tech stack at a glance

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript, built with Vite |
| UI library | MUI (Material UI) v7, react-router-dom v7 |
| Backend | Python **FastAPI** (single server on port 8000) |
| "AI" | Calls **Groq's** hosted LLM API to classify user intent |
| Data | **No database.** Mock data lives in React state and persists to `localStorage` |

There are exactly two servers at runtime:

1. **Vite dev server** (port 5173) — serves the React app.
2. **FastAPI backend** (port 8000) — only exists to turn a chat message into a structured
   "intent" (see §6).

The Vite server is configured (in `vite.config.ts`) to proxy any request starting with
`/api` to `http://127.0.0.1:8000`, so the frontend can call the backend without CORS issues.

---

## 3. How to run it

```bash
npm install          # install JS dependencies

# create a Python virtual env for the backend (first time only)
cd backend
python -m venv venv
. venv/bin/activate
pip install -r requirements.txt   # if a requirements.txt exists; otherwise install fastapi, uvicorn, httpx, python-dotenv, pydantic
cd ..

# add secrets to the .env file at the project root:
#   GROQ_API_KEY=your_groq_key
#   RESOLVER_MODE=llm            # optional: "llm" (default) or "hybrid" — see §6.4

npm run dev
```

`npm run dev` does three things:

1. `build:graph` — regenerates `src/site-graph.json` (see §5).
2. Starts Vite on port 5173.
3. Starts uvicorn (FastAPI) on port 8000.

Open **http://localhost:5173** and you land on the Dashboard.

---

## 4. Repository layout

```
├── index.html               Vite entry HTML
├── vite.config.ts           Vite config + /api proxy to port 8000
├── package.json             npm scripts & JS dependencies
├── architecture.md          this file
│
├── backend/                 FastAPI backend (Python)
│   ├── app.py               The API: POST /api/resolve-intent
│   ├── models.py            Pydantic request/response models
│   ├── site_context.py      Prompt text + site description sent to the LLM
│   ├── matcher.py           Keyword-based intent matcher (offline fallback)
│   ├── graph.py             Loads src/site-graph.json (shared with frontend!)
│   └── site-graph.json is NOT here — it lives in src/
│
├── scripts/
│   └── generate-graph.js    Builds the site graph from the React source code
│
└── src/
    ├── main.tsx             React bootstrap
    ├── App.tsx              Routing table (single source of truth for pages)
    ├── theme.ts             MUI theme (colors, typography, component styles)
    │
    ├── siteGraph.ts         TypeScript types + imports site-graph.json
    ├── site-graph.json      ⚙️ GENERATED file — the "map" of the app (§5)
    ├── graph-edges.json     ✍️ Hand-written extra connections between nodes
    │
    ├── components/          TopNav, ChatWidget, Footer (unused), SettingsLayout (unused)
    ├── context/             AppStateContext (mock data), ThemeModeContext (dark mode)
    ├── pages/               One file per page (Dashboard, CreateSet, Office, ...)
    └── tour/                The tour engine (heart of the chatbot)
        ├── bfs.ts           Shortest-path search over the site graph
        ├── resolveIntent.ts Frontend keyword fallback if the API is down
        ├── useTour.ts       React hook that drives a step-by-step highlight tour
        └── TourOverlay.tsx  The spotlight/glow/tooltip visuals
```

---

## 5. The site graph — the "map" of the app

Everything interesting depends on a JSON file called **`src/site-graph.json`**.
Think of it as a **map of every screen and every tappable element**, plus the connections
between them.

### Node IDs

Every node has an `id`. Pages use their route path with `/` turned into `.`:

- `/dashboard` → `dashboard`
- `/settings/time-marks` → `settings.time-marks`

Interactive elements are children of their page, named `pageId.data-tour-id`:

- `dashboard.dashboard-import-btn` → the "Import Questions" button
- `office.office-form-name` → the "Office Name" input in the Add Office dialog

### Node shape

Each node looks like this:

```jsonc
{
  "dashboard": {
    "path": "/dashboard",          // only page nodes have a path
    "label": "Dashboard",          // human-readable name
    "keywords": ["dashboard", "home", "question sets", "import"],  // used by the fallback matcher
    "edges": [                     // outgoing connections to other nodes
      { "to": "question-review", "selector": "[data-tour-id='nav-question-review']" },
      { "to": "dashboard.dashboard-import-btn", "selector": "[data-tour-id=\"dashboard-import-btn\"]" }
    ]
  }
}
```

An **edge** says: "to get from here to `to`, the user should interact with the element
matching `selector`." Edges with an empty `selector` are free/implicit (e.g. returning to
your parent page).

### How the graph is built (`scripts/generate-graph.js`)

The graph is **generated from your React code** every time you run `npm run dev`:

1. Parse `src/App.tsx` for `<Route>` elements → each becomes a page node (id from the path).
2. Scan each page file for `data-tour-id="..."` attributes → each becomes a child node
   (`pageId.data-tour-id`) with a CSS selector.
3. Scan each page file for `export const keywords = [...]` → attached to the page node.
4. Merge hand-written extra edges from `src/graph-edges.json` (e.g. "from dashboard to
   office" via the nav bar, or "after clicking Add Office, the form fields appear").
5. Write everything to `src/site-graph.json`.

**Convention:** to make a new element "tour-guide-able", just add `data-tour-id="some-id"`
to its JSX and re-run the build — the graph picks it up automatically.

> ⚠️ `site-graph.json` is **generated** — don't hand-edit it; edit the code and
> `graph-edges.json` instead.

### Why both the frontend AND backend read this file?

- **Frontend** (`src/siteGraph.ts`) uses it to compute routes with BFS and to know which
  selector to highlight next.
- **Backend** (`backend/graph.py`) uses it to validate that a "navigate to X" command the
  LLM produced actually points at a real node.

It lives in `src/` precisely so both sides can read the same file.

---

## 6. The chat → tour flow (the core experience)

This is the flow the whole project is built around. Follow it from a user's perspective:

### 6.1 The happy path, step by step

```
User types: "take me to the import button"
        │
        ▼
┌─────────────────────────────┐
│ 1. ChatWidget (frontend)    │  maps current URL /dashboard
│    maps pathname → node id  │  to node id "dashboard"
└──────────────┬──────────────┘
        │ POST /api/resolve-intent
        │ { userMessage, currentNodeId, chatHistory }
        ▼
┌─────────────────────────────┐
│ 2. FastAPI backend (app.py) │  builds a prompt from site_context.py +
│    calls Groq LLM           │  the site graph, asks the model:
│                             │  "what should the app do?"
└──────────────┬──────────────┘
        │ JSON: { commands: [ { action: "navigate",
        │         targetNodeId: "dashboard.dashboard-import-btn",
        │         startMessage: "I'll guide you there!" } ] }
        ▼
┌─────────────────────────────┐
│ 3. ChatWidget               │  "navigate" command → compute shortest
│    BFS over the site graph  │  path from current node to target
└──────────────┬──────────────┘
        │ steps: [{ to: "dashboard.dashboard-import-btn",
        │           selector: "[data-tour-id='dashboard-import-btn']" }]
        ▼
┌─────────────────────────────┐
│ 4. useTour (tour engine)    │  step executor:
│                             │   • find element by selector (retry 5×)
│                             │   • scroll it into view
│                             │   • add .tour-highlight class
│                             │   • track its position 60fps (rAF loop)
│                             │   • wait for the user to interact
└──────────────┬──────────────┘
        │ TourOverlay renders spotlight + glow ring + tooltip
        │ "Click or interact with the highlighted area"
        ▼
┌─────────────────────────────┐
│ 5. User clicks the button   │  click handler fires → advance to next
│    → tour completes         │  step (or finish: "You are there!")
└─────────────────────────────┘
```

### 6.2 Step 1 — ChatWidget decides what to do (`src/components/ChatWidget.tsx`)

When the user hits send:

1. **Map the current URL to a node id** via `pathnameToNodeId(location.pathname)`.
   If the URL isn't in the graph, the bot says it can't determine the location.
2. **Call the backend** `POST /api/resolve-intent` with the message, the current node id,
   and the last 6 chat messages as context.
3. **If the API fails** (offline, timeout, no key), it falls back to a local keyword
   matcher in `src/tour/resolveIntent.ts`. (So the chat still works without a backend —
   just less smartly.)
4. The response is a list of **commands**. Each command is one of:
   - `navigate` → highlight/show a page or element (the main case)
   - `answer` → just print the bot's text, no tour
   - `clarify` → print a question and remember context for the next message
   - `form` → guide through a multi-field form (see §6.5)
5. Each `navigate`/`form` command is turned into a **tour segment** — a list of steps
   (edges) computed with `bfsPath()` from the current node to the target. Multiple
   commands are chained in order (the bot can handle "go to X, then click Y").
6. All segments are handed to `startChainedTour(...)` from the `useTour` hook.

### 6.3 Step 2 — the backend (`backend/app.py`)

The backend has exactly **one** endpoint. It:

1. Loads the site graph (same file the frontend uses).
2. Builds a prompt from:
   - `SITE_CONTEXT` — a plain-English description of every page and its buttons
     (hand-maintained in `backend/site_context.py`).
   - `SYSTEM_PROMPT` — instructions telling the LLM *how* to classify requests
     (rules like: "import" must map to `dashboard.dashboard-import-btn`,
     "create a question set" must map to `create-set`, greetings are `answer`).
3. Calls **Groq** (`openai/gpt-oss-120b` model) and asks it to return **only JSON**.
4. Parses the JSON into `IntentResponse` (list of `Command`), validating that any
   `navigate` target actually exists in the graph. Invalid targets become `clarify`.
5. Writes the raw LLM output to `backend/llm_output_debug.log` for debugging.

### 6.4 The two resolver modes (`RESOLVER_MODE` env var)

- **`llm` (default)** — the Groq LLM decides everything.
- **`hybrid`** — after the LLM responds, a local keyword matcher
  (`backend/matcher.py`) re-scores the request and can *override* the target for a
  single standalone `navigate` command. This was added as a safety net because
  LLM output can drift from the graph.

The frontend has its own independent fallback in `src/tour/resolveIntent.ts`
(step 3 above), which is used when the backend call itself fails.

### 6.5 Step 3 — the tour engine (`src/tour/useTour.ts`)

This hook is the muscle. Given a list of steps (edges), it executes them one at a time:

**For each step:**

- If the edge has **no selector** (implicit edge), auto-advance.
- Otherwise, poll `document.querySelector(step.selector)` — up to 5 attempts, 200 ms
  apart (the element may not have rendered yet, e.g. a dialog still opening).
- **Text inputs that are already filled are skipped** (no highlight, no waiting) —
  "I'll skip any fields you've already filled out!"
- Scroll the element into view, add the `tour-highlight` CSS class, and start a
  `requestAnimationFrame` loop that tracks the element's bounding rectangle (so the
  overlay follows it if the page scrolls).
- **Wait for the right completion signal**, depending on the element type:
  | Element | Completion signal |
  |---|---|
  | Plain button/element | `click` |
  | Text input / textarea | `blur` or `Enter` key |
  | MUI dropdown (`role="combobox"`) | custom `tour:dropdown-closed` event |
  | Radio group | `change` event |
- Then advance to the next step, or finish the segment.

**Route changes:** if a step's target node has a `path` (i.e. it's a page), the hook also
watches `useLocation()`. When the router reaches that path, the step completes — so
clicking a nav button *both* changes the URL and completes the step, without a double
advance.

**Cancellation:** typing "stop / cancel / quit / nevermind" in the chat (or clicking the
"Cancel Tour" button) tears down highlights and timers and returns to normal.

### 6.6 The visuals (`src/tour/TourOverlay.tsx`)

While a step is active, three layers are drawn over the page:

1. A **spotlight mask** — `box-shadow: 0 0 0 9999px rgba(...)` dims everything except
   the highlighted element.
2. A **glowing ring** around the target (pulsing aura + corner brackets).
3. A **tooltip** with the bot's hint message, positioned above or below the target
   depending on available space.

**Bonus:** the chat panel itself moves out of the way. `ChatWidget` computes an
*adaptive layout* — if the highlighted element would sit underneath the chat box, the box
shrinks and slides above/below/left of the element instead.

---

## 7. Data & state management (no database!)

All data is **mock data in the browser**. There is no database and no auth.

**`src/context/AppStateContext.tsx`** owns the app's "database":

- Question sets, offices, clients, and settings.
- Seeded with sample rows (e.g. "Set 1204" from Mumbai, office "Mumbai Office", client
  "Oceanic Shipping Co.").
- Every change is persisted to `localStorage` (keys like `app_questionSets`), and state
  is re-hydrated from `localStorage` on load.

**`src/pages/QuestionReviewPage.tsx`** keeps its own separate `localStorage` store
(`qr_questions_v2`) seeded with a few sample questions.

The backend never reads or writes this data — it only classifies intent.

**`src/context/ThemeModeContext.tsx`** handles light/dark mode (persisted as
`theme_mode`), rebuilding the MUI theme when toggled.

---

## 8. The pages

| Route | File | What it does |
|---|---|---|
| `/` → redirect | `App.tsx` | Redirects to `/dashboard` |
| `/dashboard` | `DashboardPage.tsx` | Question-set table with expandable history, office/rank filters, stat cards, action buttons (Create Set, Question Bank, Import, Deleted) |
| `/create-set` | `CreateSetPage.tsx` | Build a question set: Auto Create / Manual / Template tabs. "Generate" validates and adds a set |
| `/question-review` | `QuestionReviewPage.tsx` | Review/validate questions: filter bar, editable question cards, correct-answer toggles, review progress sidebar |
| `/office` | `OfficePage.tsx` | Office CRUD table + Add/Edit dialog |
| `/manage-clients` | `ManageClientsPage.tsx` | Client CRUD table + Add/Edit dialog |
| `/settings/time-marks` | `TimeMarksSettingsPage.tsx` | Marks (easy/intermediate/difficult) + time limits per question type |
| `/settings/percentage` | `PercentageSettingsPage.tsx` | Pass-percentage thresholds per Deck/Engine rank |

Navigation is a sticky top bar (`TopNav.tsx`) with the pages plus a Settings dropdown.
Note the top nav buttons carry `data-tour-id` attributes — they're graph nodes too.

---

## 9. Known quirks & leftovers (read before you touch code)

The project was refactored from a generic template app ("TourBot", with projects/billing/
pricing pages) into the maritime app, and some template remnants survived:

- **`Footer.tsx` and `SettingsLayout.tsx` are unused** — not rendered in `App.tsx`.
  `SettingsLayout` still references old routes like `/settings/profile` that don't exist.
- **`ChatWidget.tsx` still contains `NEW_PROJECT_FORM_STEPS`** for a `new_project` form
  on a `projects` page that no longer exists. The `form` command path in the frontend is
  effectively dead code today (the LLM prompt only ever emits `navigate`/`answer`/
  `clarify`).
- **Env var typo:** `backend/app.py` reads `GROK_API_KEY` (with a K), but Groq's API key
  is normally called `GROQ_API_KEY`. If the bot always says "something went wrong", check
  which name your `.env` uses.
- **The bot's greeting** mentions "Take me to billing" / "Show me pricing" — pages that
  were deleted.
- `package.json` lists `@mui/x-data-grid` and the theme styles it, but no page currently
  uses the DataGrid component (pages use plain MUI tables).

---

## 10. A worked example

**User (on Dashboard):** "show me where to import questions"

1. `ChatWidget` maps `/dashboard` → node `dashboard`.
2. `POST /api/resolve-intent` → the LLM, guided by `SITE_CONTEXT` + prompt rules,
   returns `{ action: "navigate", targetNodeId: "dashboard.dashboard-import-btn", ... }`.
3. Backend validates `dashboard.dashboard-import-btn` exists in `site-graph.json` ✅.
4. `ChatWidget` calls `bfsPath("dashboard", "dashboard.dashboard-import-btn")` →
   a single step: highlight `[data-tour-id="dashboard-import-btn"]`.
5. `startChainedTour` → `useTour` finds the button, scrolls to it, `TourOverlay` puts a
   spotlight + tooltip on it.
6. User clicks Import Questions → step completes → bot says "You are there!"
   (the completion message).

**User (on Dashboard):** "go to settings and open percentage settings"

1. LLM returns **two chained commands**:
   `navigate → nav-settings`, then `navigate → settings.percentage`.
2. `ChatWidget` builds two segments. The tour highlights the **Settings** nav button
   first; the route-change watcher detects the dropdown page change; then it highlights
   the **Percentage Settings** menu item; the user clicks it; tour finishes.
