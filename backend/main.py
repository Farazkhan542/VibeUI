from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from models import VibeChatRequest, ResearchRequest
from gemini import run_vibe_chat, run_research
from stitch import polish_with_stitch
from dotenv import load_dotenv
import json
import asyncio

load_dotenv()

app = FastAPI(title="VibeUI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Phase 1: Vibe interview ─────────────────────────────────────
@app.post("/api/chat")
async def chat(req: VibeChatRequest):
    messages = [m.model_dump() for m in req.messages]
    return await run_vibe_chat(messages)


# ── Phase 2 + 3: Research → Generate → Polish (streamed SSE) ───
@app.post("/api/build")
async def build(req: ResearchRequest):
    queue: asyncio.Queue = asyncio.Queue()

    async def stream_callback(msg: str):
        await queue.put({"event": "activity", "data": msg})

    async def run():
        try:
            # Phase 2 — Gemini research + codegen
            result = await run_research(req.brief, stream_callback)

            await stream_callback("Sending to Stitch for polish ...")

            # Phase 3 — Stitch polish
            polished_code = await polish_with_stitch(
                req.brief, result["component_code"]
            )

            await stream_callback("Done")

            await queue.put({
                "event": "done",
                "data": json.dumps({
                    "competitors": result.get("competitors", []),
                    "dominant_pattern": result.get("dominant_pattern", ""),
                    "opportunity": result.get("opportunity", ""),
                    "component_code": polished_code
                })
            })
        except Exception as e:
            await queue.put({"event": "error", "data": str(e)})
        finally:
            await queue.put(None)

    async def generator():
        asyncio.create_task(run())
        while True:
            item = await queue.get()
            if item is None:
                break
            yield item

    return EventSourceResponse(generator())


@app.get("/health")
async def health():
    return {"status": "ok"}
