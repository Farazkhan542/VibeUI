# VibeUI — AI-Powered UI Generation from a Vibe Interview

VibeUI turns a short, conversational design brief into a real, working React
component — researched against actual competitors in the client's niche, not
generated from a generic template.

**The flow:** a 4-question chat interview → live Google Search-grounded
competitor research → a generated React + Tailwind component, rendered in a
sandboxed live preview you can copy, download, or export as a runnable
project.

## Why this exists

Most "AI UI generator" demos skip the parts that make a tool actually usable
by more than one person: authentication, not leaking your API key, handling
a model's output when it doesn't come back exactly as asked, and not
crashing when it doesn't. This project treats those as first-class problems,
not an afterthought bolted on after the demo works.

## How it works

1. **Vibe interview** — Gemini runs a structured 4-question intake (what
   you're building, a design reference, your target user, the feeling you
   want) and converts the answers into a structured design brief.
2. **Research** — Gemini, using live Google Search grounding, finds 3–5 real
   competitors in the niche, analyzes their color/type/layout patterns, and
   identifies one overused pattern and one differentiation opportunity —
   streamed to the UI in real time over Server-Sent Events.
3. **Generation** — Gemini writes a complete, self-contained React +
   Tailwind component matching the brief and the identified opportunity,
   returned as a separate fenced code block rather than JSON-escaped inline
   (a real React component reliably contains characters that break strict
   JSON string escaping at any real size — this is parsed as two independent
   pieces instead of one fragile blob).
4. **Preview & export** — the component renders live in a sandboxed preview
   (Sandpack). From there: copy the code, download it as a `.tsx` file, or
   export a complete runnable Vite + React + TypeScript project as a zip.

## Architecture

```
frontend/   Next.js 16 (App Router) · TypeScript · Tailwind v4 · Zustand · Framer Motion
backend/    FastAPI · google-genai (Gemini 2.5) · Server-Sent Events
            Supabase (Postgres + Auth) for accounts, encrypted API keys, and project history
```

**Accounts & API keys.** Every visitor logs in and brings their own Gemini
API key — this isn't a shared-key demo that one person's traffic can drain.
Keys are encrypted at rest (Fernet, server-side only key) and resolved
per-request; the decrypted key never touches disk or a log line, and never
leaves the backend. Postgres Row-Level Security ensures a user can only ever
read their own key or their own project history.

**Project history.** Every generation is saved to the account that made it
and browsable later — reopen any past result read-only.

**Resilience.** The backend distinguishes real failure modes instead of
surfacing raw errors: a missing/invalid key, an exhausted quota (Gemini's
free tier is capped at 20 requests/day per model — the UI surfaces this with
a dedicated popup, not a silent failure), and malformed model output all get
handled explicitly rather than crashing the request.

## Stack

| | |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, Framer Motion, Sandpack |
| Backend | FastAPI, `google-genai` (Gemini 2.5 Flash/Pro), `sse-starlette`, `cryptography` (Fernet) |
| Data/Auth | Supabase (Postgres, Auth, Row-Level Security) |
| AI | Gemini 2.5, with Google Search tool-use for live competitor research |

## Running locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
# .env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ENCRYPTION_KEY (see below)
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
# .env.local: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Generate a Fernet key for `ENCRYPTION_KEY` with:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

You'll also need a [Supabase](https://supabase.com) project (see
`supabase/schema.sql` for the table/RLS setup) and your own
[Gemini API key](https://aistudio.google.com/apikey), added from the app's
Settings page after signing in.

## What I'd build next

- Multi-provider model support (currently Gemini-only by design)
- Real integration with Google's Stitch design tool (its actual API is an
  async, project/screen-based MCP workflow — a legitimately different
  integration shape than the one-shot "polish this code" call a first pass
  might assume)
- Usage analytics per account
