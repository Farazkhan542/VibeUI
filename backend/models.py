from pydantic import BaseModel
from typing import Optional, List


class VibeMessage(BaseModel):
    role: str         # "user" | "assistant"
    content: str


class VibeChatRequest(BaseModel):
    messages: List[VibeMessage]


class DesignBrief(BaseModel):
    industry: str
    niche: str
    vibe_reference: Optional[str] = None
    feeling: str
    target_user: str
    color_mood: str
    layout_density: str
    typography_feel: str


class ResearchRequest(BaseModel):
    brief: DesignBrief
