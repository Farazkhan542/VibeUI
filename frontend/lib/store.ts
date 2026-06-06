import { create } from 'zustand'
import type { Message, DesignBrief, Phase } from './types'

interface AppState {
  messages: Message[]
  brief: DesignBrief | null
  activityLog: string[]
  competitors: string[]
  dominantPattern: string
  opportunity: string
  componentCode: string | null
  phase: Phase

  addMessage: (m: Message) => void
  setBrief: (b: DesignBrief) => void
  addLog: (line: string) => void
  setResult: (data: {
    competitors: string[]
    dominant_pattern: string
    opportunity: string
    component_code: string
  }) => void
  setPhase: (p: Phase) => void
  reset: () => void
}

const initial = {
  messages: [],
  brief: null,
  activityLog: [],
  competitors: [],
  dominantPattern: '',
  opportunity: '',
  componentCode: null,
  phase: 'vibe' as const,
}

export const useStore = create<AppState>((set) => ({
  ...initial,
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setBrief: (b) => set({ brief: b }),
  addLog: (line) => set((s) => ({ activityLog: [...s.activityLog, line] })),
  setResult: (d) =>
    set({
      competitors: d.competitors,
      dominantPattern: d.dominant_pattern,
      opportunity: d.opportunity,
      componentCode: d.component_code,
    }),
  setPhase: (p) => set({ phase: p }),
  reset: () => set(initial),
}))
