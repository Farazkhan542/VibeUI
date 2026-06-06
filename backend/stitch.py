import httpx
import os
from models import DesignBrief

STITCH_URL = os.getenv("STITCH_MCP_URL", "https://stitch.googleapis.com/mcp")
STITCH_KEY = os.getenv("STITCH_API_KEY")


async def polish_with_stitch(brief: DesignBrief, component_code: str) -> str:
    if not STITCH_KEY or STITCH_KEY == "your_stitch_key":
        # Stitch not configured — return original code unchanged
        return component_code

    prompt = f"""
Polish this React + Tailwind component to production quality.

Client brief:
- Industry: {brief.industry} — {brief.niche}
- Target user: {brief.target_user}
- Desired feeling: {brief.feeling}
- Color mood: {brief.color_mood}
- Layout density: {brief.layout_density}
- Typography: {brief.typography_feel}

Component to polish:
{component_code}

Refine: spacing rhythm, typography hierarchy, color consistency,
visual depth, and micro-details. Return ONLY the updated JSX component code.
"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                STITCH_URL,
                headers={
                    "X-Goog-Api-Key": STITCH_KEY,
                    "Content-Type": "application/json"
                },
                json={"tool": "generate_ui", "input": {"prompt": prompt}}
            )
            response.raise_for_status()
            result = response.json()
            # Extract code — try multiple possible response keys
            polished = (
                result.get("code")
                or result.get("html")
                or result.get("output")
                or result.get("result")
            )
            return polished if polished else component_code
    except Exception:
        # Stitch failure is non-fatal — return original Gemini output
        return component_code
