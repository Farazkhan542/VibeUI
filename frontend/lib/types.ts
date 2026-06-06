export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface DesignBrief {
  brief_ready?: boolean
  industry: string
  niche: string
  vibe_reference?: string
  feeling: string
  target_user: string
  color_mood: string
  layout_density: string
  typography_feel: string
}

export interface ResearchResult {
  competitors: string[]
  dominant_pattern: string
  opportunity: string
  component_code: string
}

export type Phase = 'vibe' | 'research' | 'done'
