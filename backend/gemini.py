import os
import json
import asyncio
from google import genai
from google.genai import types
from models import DesignBrief
from prompts import VIBE_SYSTEM, RESEARCH_SYSTEM

_client: genai.Client | None = None

def get_client() -> genai.Client:
    global _client
    if _client is None:
        # Force GEMINI_API_KEY — prevent system GOOGLE_API_KEY from interfering
        api_key = os.environ["GEMINI_API_KEY"]
        os.environ.pop("GOOGLE_API_KEY", None)
        _client = genai.Client(api_key=api_key)
    return _client

MODEL = "gemini-2.5-flash"


async def run_vibe_chat(messages: list) -> dict:
    client = get_client()

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

    chat = client.aio.chats.create(model=MODEL, history=history, config=config)
    response = await chat.send_message(messages[-1]["content"])
    text = response.text.strip()

    # Strip markdown fences
    clean = text.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(clean)
        if data.get("brief_ready"):
            return {"type": "brief", "brief": data, "message": None}
    except Exception:
        pass

    return {"type": "message", "message": text, "brief": None}


async def run_research(brief: DesignBrief, stream_callback=None) -> dict:
    client = get_client()

    if stream_callback:
        await stream_callback(f'Searching "{brief.niche} best UI examples 2025" ...')

    config = types.GenerateContentConfig(
        system_instruction=RESEARCH_SYSTEM,
        tools=[types.Tool(google_search=types.GoogleSearch())],
        temperature=0.7,
    )

    response = await client.aio.models.generate_content(
        model=MODEL,
        contents=f"Design brief:\n{brief.model_dump_json(indent=2)}",
        config=config,
    )

    if stream_callback:
        await stream_callback("Analyzing competitor UI patterns ...")
        await stream_callback("Identifying opportunity gap ...")
        await stream_callback("Generating React component ...")

    raw = response.text.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start != -1 and end > start:
            data = json.loads(raw[start:end])
        else:
            raise ValueError(f"Could not parse Gemini response: {raw[:300]}")

    return data
