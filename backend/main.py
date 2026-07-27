import os
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import VibeChatRequest, ResearchRequest, SettingsKeyRequest
from gemini import run_vibe_chat, run_research
from auth import get_current_user_id, get_admin_client
from crypto import encrypt, decrypt
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="VibeUI API")

# FRONTEND_URL lets a deployed frontend (Vercel, etc.) talk to this backend
# without a code change — defaults cover the local dev server.
_allowed_origins = {"http://localhost:3000", "http://127.0.0.1:3000"}
if os.environ.get("FRONTEND_URL"):
    _allowed_origins.add(os.environ["FRONTEND_URL"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_allowed_origins),
    allow_methods=["*"],
    allow_headers=["*"],
)


def clean_error(e: Exception) -> tuple[int, str]:
    """Turns a raw Gemini/SDK exception into a status code + a message
    that's actually useful to a user, instead of a raw JSON blob."""
    text = str(e)
    if "RESOURCE_EXHAUSTED" in text or "quota" in text.lower():
        return 429, (
            "Your Gemini API key has hit its usage quota. Wait a while and try "
            "again, or check your plan and limits at "
            "ai.google.dev/gemini-api/docs/rate-limits."
        )
    if "API_KEY_INVALID" in text or "API key not valid" in text:
        return 401, "That Gemini API key isn't valid. Double-check it in Settings."
    return 500, text


def resolve_gemini_key(user_id: str) -> str:
    result = (
        get_admin_client()
        .table("profiles")
        .select("gemini_api_key_encrypted")
        .eq("id", user_id)
        .single()
        .execute()
    )
    encrypted = result.data.get("gemini_api_key_encrypted") if result.data else None
    if not encrypted:
        raise HTTPException(status_code=400, detail="No Gemini API key saved. Add one in Settings.")
    return decrypt(encrypted)


# ── Account settings: Gemini API key ────────────────────────────
@app.post("/api/settings/key")
async def save_key(req: SettingsKeyRequest, user_id: str = Depends(get_current_user_id)):
    encrypted = encrypt(req.api_key)
    get_admin_client().table("profiles").update({"gemini_api_key_encrypted": encrypted}).eq("id", user_id).execute()
    return {"ok": True}


@app.get("/api/settings/key/status")
async def key_status(user_id: str = Depends(get_current_user_id)):
    result = (
        get_admin_client()
        .table("profiles")
        .select("gemini_api_key_encrypted")
        .eq("id", user_id)
        .single()
        .execute()
    )
    has_key = bool(result.data and result.data.get("gemini_api_key_encrypted"))
    return {"hasKey": has_key}


@app.delete("/api/settings/key")
async def clear_key(user_id: str = Depends(get_current_user_id)):
    get_admin_client().table("profiles").update({"gemini_api_key_encrypted": None}).eq("id", user_id).execute()
    return {"ok": True}


# ── Phase 1: Vibe interview ─────────────────────────────────────
@app.post("/api/chat")
async def chat(req: VibeChatRequest, user_id: str = Depends(get_current_user_id)):
    messages = [m.model_dump() for m in req.messages]
    try:
        api_key = resolve_gemini_key(user_id)
        return await run_vibe_chat(messages, api_key)
    except HTTPException:
        raise
    except Exception as e:
        status, detail = clean_error(e)
        raise HTTPException(status_code=status, detail=detail)


# ── Phase 2 + 3: Research → Generate → Polish ───────────────────
# A single request/response (not streamed): serverless hosts run one
# invocation per request, so the fire-and-forget task + SSE queue pattern
# isn't a good fit there. The frontend shows a client-side progress
# animation while this one call runs.
@app.post("/api/build")
async def build(req: ResearchRequest, user_id: str = Depends(get_current_user_id)):
    api_key = resolve_gemini_key(user_id)
    try:
        # Phase 2 — Gemini research + multi-screen codegen
        result = await run_research(req.brief, api_key, req.model)

        screens = result.get("screens", [])
        # component_code mirrors the first screen so the not-null DB column
        # and any older single-component code path still have a value.
        first_code = screens[0]["code"] if screens else ""

        return {
            "competitors": result.get("competitors", []),
            "dominant_pattern": result.get("dominant_pattern", ""),
            "opportunity": result.get("opportunity", ""),
            "screens": screens,
            "component_code": first_code,
        }
    except HTTPException:
        raise
    except Exception as e:
        status, detail = clean_error(e)
        raise HTTPException(status_code=status, detail=detail)


@app.get("/health")
async def health():
    return {"status": "ok"}
