---
title: VibeUI Backend
emoji: 🎨
colorFrom: gray
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# VibeUI Backend

FastAPI backend for [VibeUI](https://github.com/Farazkhan542/VibeUI) — the AI
UI-generation app. Runs Gemini (with Google Search grounding) behind a
Supabase-authenticated API and streams generation progress over Server-Sent
Events.

This Space hosts only the backend. It expects these secrets to be set under
**Settings → Variables and secrets**:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ENCRYPTION_KEY`
- `FRONTEND_URL` (the deployed frontend's URL, for CORS)
- `STITCH_API_KEY` (optional)
- `STITCH_MCP_URL` (optional)
