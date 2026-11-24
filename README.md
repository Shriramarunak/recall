# Recall

A frontend-only study app for AI and ML engineering interview prep, built with Vite + React.
Ships four courses (GenAI Engineering, ML Foundations, LangChain & LangGraph, Cloud AI) with
study modes — read, flashcards with spaced repetition, quiz, mock interview — plus a dashboard
and a live AI news feed. All progress is stored in the browser; there is no backend.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## How it is put together

```
src/
  api/client.js          the only module that touches content — swap for fetch() later
  data/
    catalog.json         course list (what the home page and nav need)
    courses/
      genai-engineering.json   one course document: modules + topics
  lib/course.js          pure selectors over a course document (no React, no imports)
  hooks/
    useCourse.js         loads a course through the API, with loading/error states
    useProgress.jsx      studied / flagged / last-read, persisted to localStorage
  components/            TopNav, Footer, TopicRail, IndexTicks, QueryPath, Logo
  pages/                 Home, Course (syllabus), Topic (reader), Flashcards, Interview
  styles/                tokens.css + one file per surface
scripts/build-content.mjs  regenerates src/data from the original single-file lab
```

Routes: `/`, `/course/:courseId`, `/course/:courseId/topic/:topicId`,
`/course/:courseId/flashcards` (`?deck=due` opens the spaced-repetition queue),
`/course/:courseId/quiz`, `/course/:courseId/interview`, `/course/:courseId/dashboard`.

### Study features

- **Spaced repetition** — SM-2 scheduler (`src/lib/srs.js`); the "Due today" flashcard deck shows what's
  scheduled and Again/Hard/Good/Easy grade each card.
- **Quiz** — multiple-choice questions generated from the follow-ups, scored, with misses linked to the lesson.
- **Streaks, goals & heatmap** — the dashboard (`src/lib/study.js`) shows the current streak, a weekly goal,
  an activity heatmap and a "weak areas" list (hard + flagged lessons).
- **Command palette** — ⌘K / Ctrl-K (or the nav button) to jump to any lesson or mode.
- **Notes** — a per-lesson textarea, saved locally, exportable as Markdown.
- **Difficulty tags** — mark a lesson Easy/Medium/Hard; Hard surfaces in weak areas.
- **Concept diagrams** — authored inline SVGs (`src/components/ConceptDiagram.jsx`) keyed by topic id.
- **Glossary** — terms in `src/data/glossary.json` auto-link in lesson text with a hover definition.

## Content schema

`src/data/catalog.json` — the list every course picker reads:

```json
{
  "schemaVersion": 1,
  "courses": [
    {
      "id": "genai-engineering",
      "title": "GenAI Engineering",
      "subtitle": "…",
      "level": "Mid to senior",
      "updatedAt": "2026-11-23",
      "moduleCount": 21,
      "topicCount": 70,
      "minutes": 422,
      "tags": ["RAG", "Transformers"],
      "status": "published"
    }
  ]
}
```

`src/data/courses/<id>.json` — one document per course:

```json
{
  "id": "genai-engineering",
  "schemaVersion": 1,
  "title": "GenAI Engineering",
  "subtitle": "…",
  "level": "Mid to senior",
  "updatedAt": "2026-11-23",
  "modules": [
    { "id": "retrieval", "title": "Retrieval", "order": 3, "note": "One line on what the track covers." }
  ],
  "topics": [
    {
      "id": "bm25",
      "moduleId": "retrieval",
      "order": 10,
      "title": "BM25",
      "minutes": 8,
      "concept": "What it is.",
      "example": "A worked example.",
      "interviewAnswer": "The answer you would say out loud.",
      "steps": ["Ordered build steps"],
      "tradeoffs": ["What you give up"],
      "followUps": [{ "question": "…", "answer": "…" }],
      "code": null
    }
  ]
}
```

Rules the app relies on: `topic.id` and `module.id` are unique within a course and URL-safe,
every `topic.moduleId` matches a module, and `topic.order` is the global reading order.
`code` is either a string or `null`.

### Courses

Four courses ship today, all driven by the same `:courseId` routes:

| id | title | lessons |
| --- | --- | --- |
| `genai-engineering` | GenAI Engineering | 70 |
| `ml-foundations` | Machine Learning Foundations | 8 |
| `langchain-langgraph` | LangChain & LangGraph (code snippets) | 8 |
| `cloud-ai` | Cloud AI Platforms (AWS, Azure, GCP) | 10 |

Browse them at `/courses`; each course's study modes live on its course page.

### Learning paths

`/paths` lists ordered, multi-course sequences (e.g. **AI Engineer**: ML Foundations → GenAI →
LangChain → Cloud AI). Each path (`/path/:pathId`) renders a **roadmap.sh-style interactive graph**
built with [React Flow](https://reactflow.dev) (`src/components/PathFlow.jsx`): a central spine of
course milestones and module nodes, with each module's lessons branching left/right as connected
topic nodes. Pan, zoom, and click any node to open it; studied lessons and completed modules are
filled in. Above it sits a path-level progress bar and a "continue" button to the current course.
Data in `src/data/paths.json`, helpers in `src/lib/paths.js`.

### Videos

`/videos` embeds a public YouTube playlist through the privacy-friendly `youtube-nocookie` host
(responsive 16:9), with a link out to the full playlist.

### Global search & backup

- **⌘K / Ctrl-K** opens a command palette that searches lessons across **every** course, plus
  courses and study modes. Also reachable from the "Jump to…" button in the nav.
- The **dashboard** has an Export / Import panel: progress is a single JSON payload
  (`recall-progress.json`) you can download to back up or move between devices. Frontend-only;
  no account needed.

### News

`/news` pulls live AI / LLM / GenAI stories from the public, CORS-enabled
[Hacker News Algolia API](https://hn.algolia.com/api) — no key, no backend. Topic chips and a
search box set the query; Top/Recent switches `search` vs `search_by_date`. Fetch logic is in
`src/lib/news.js`, all read-only.

### Adding a course

1. Write `src/data/courses/<your-id>.json` in the shape above.
2. Add its summary row to `src/data/catalog.json`.
3. Register it in the `COURSES` map in `src/api/client.js`.

Nothing else changes — every screen is driven by `:courseId`.

## Moving to a backend

`src/api/client.js` is the seam. Replace the local imports with requests and keep the
signatures:

```js
const API = import.meta.env.VITE_API_URL;

export const fetchCatalog = () => fetch(`${API}/courses`).then((r) => r.json());
export const fetchCourse = (id) => fetch(`${API}/courses/${id}`).then((r) => r.json());
```

Every screen already handles a pending state, so no component needs to change. Progress is
stored under one localStorage key (`retrieval-lab:progress`) in the shape a `/progress`
endpoint would accept:

```json
{
  "version": 2,
  "courses": {
    "genai-engineering": {
      "studied": { "bm25": "2026-11-23T…" },
      "flagged": { "hybrid-search": true },
      "lastTopicId": "bm25",
      "notes": { "bm25": "my own phrasing…" },
      "difficulty": { "bm25": "hard" },
      "srs": { "bm25::main": { "ease": 2.5, "interval": 6, "reps": 3, "lapses": 0, "due": "2026-11-29" } }
    }
  },
  "activity": { "2026-11-23": 4 },
  "goals": { "weekly": 12 }
}
```

`activity` (study-days) and `goals` are global; everything else is per course. Older v1 payloads are
migrated forward automatically on read.

## Regenerating content

The course was imported from a single-file HTML study lab:

```bash
npm run data:build -- "C:/Users/HP/Downloads/GenAI_Engineering_Interview_Lab_V2.html"
```

Track notes and reading-time estimates live in that script, not in the HTML.

## Design

Three colours carry the whole UI: `#ff6a1a` orange, `#ffffff`/`#f5f2ec` white, and
`#17120d` near-black. Icons are a single stroke-based inline-SVG set (`src/components/Icon.jsx`)
that inherits `currentColor` — no icon font, no emoji. Type is Space Grotesk (display), Inter
(body) and JetBrains Mono (lesson numbers, counts, labels). The progress meter is the course
itself — one tick per lesson, in reading order, filled when you mark it studied; an orange ring
means flagged to revisit. Tokens live in `src/styles/tokens.css`; recolouring the app is a
matter of editing the three accent values there.
