import os
import json
from google import genai
from google.genai import types
from models import DesignBrief
from prompts import VIBE_SYSTEM, RESEARCH_SYSTEM

ALLOWED_MODELS = {"gemini-2.5-flash", "gemini-2.5-pro"}
DEFAULT_MODEL = "gemini-2.5-flash"


def get_client(api_key: str) -> genai.Client:
    # A shared deployment serves many users' own keys concurrently, so this
    # builds a fresh client per request rather than caching a singleton.
    if not api_key:
        raise RuntimeError("No Gemini API key available for this request.")
    # If GOOGLE_API_KEY is set anywhere in the environment, the SDK prefers
    # it over the api_key we pass explicitly — drop it so each request
    # actually uses that user's own key.
    os.environ.pop("GOOGLE_API_KEY", None)
    return genai.Client(api_key=api_key)


def _resolve_model(model: str) -> str:
    return model if model in ALLOWED_MODELS else DEFAULT_MODEL


async def run_vibe_chat(messages: list, api_key: str, model: str = DEFAULT_MODEL) -> dict:
    client = get_client(api_key)
    model = _resolve_model(model)

    # Build history (all messages except last)
    # New SDK uses "model" not "assistant"
    history = [
        types.Content(
            role="model" if m["role"] == "assistant" else "user",
            parts=[types.Part(text=m["content"])]
        )
        for m in messages[:-1]
    ]

    config = types.GenerateContentConfig(
        system_instruction=VIBE_SYSTEM,
        temperature=0.7,
    )

    chat = client.aio.chats.create(model=model, history=history, config=config)
    response = await chat.send_message(messages[-1]["content"])
    text = response.text.strip()

    # Strip markdown fences
    clean = text.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(clean, strict=False)
        if data.get("brief_ready"):
            return {"type": "brief", "brief": data, "message": None}
    except Exception:
        pass

    return {"type": "message", "message": text, "brief": None}


async def run_research(brief: DesignBrief, api_key: str, model: str = DEFAULT_MODEL, stream_callback=None) -> dict:
    client = get_client(api_key)
    model = _resolve_model(model)

    if stream_callback:
        await stream_callback(f'Searching "{brief.niche} best UI examples 2025" ...')

    config = types.GenerateContentConfig(
        system_instruction=RESEARCH_SYSTEM,
        tools=[types.Tool(google_search=types.GoogleSearch())],
        temperature=0.7,
    )

    response = await client.aio.models.generate_content(
        model=model,
        contents=f"Design brief:\n{brief.model_dump_json(indent=2)}",
        config=config,
    )

    if stream_callback:
        await stream_callback("Analyzing competitor UI patterns ...")
        await stream_callback("Identifying opportunity gap ...")
        await stream_callback("Generating React component ...")

    raw = response.text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    # strict=False: the model sometimes emits literal newlines/tabs inside
    # the component_code string instead of escaping them as \n — those are
    # control characters that strict JSON parsing rejects outright.
    try:
        data = json.loads(raw, strict=False)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            data = json.loads(raw[start:end], strict=False)
        else:
            raise ValueError(f"Could not parse Gemini response: {raw[:300]}")

    return data
