import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Message, DesignBrief, Phase, Screen } from './types'

interface AppState {
  messages: Message[]
  brief: DesignBrief | null
  activityLog: string[]
  competitors: string[]
  dominantPattern: string
  opportunity: string
  componentCode: string | null
  screens: Screen[]
  selectedScreen: number
  phase: Phase
  hasHydrated: boolean
  model: 'gemini-2.5-flash' | 'gemini-2.5-pro'
  globalError: string | null

  addMessage: (m: Message) => void
  setBrief: (b: DesignBrief) => void
  addLog: (line: string) => void
  setResult: (data: {
    competitors: string[]
    dominant_pattern: string
    opportunity: string
    screens?: Screen[]
    component_code: string
  }) => void
  setSelectedScreen: (i: number) => void
  setPhase: (p: Phase) => void
  reset: () => void
  regenerate: () => void
  setHasHydrated: (v: boolean) => void
  setModel: (m: AppState['model']) => void
  setGlobalError: (message: string | null) => void
}

const initial = {
  messages: [],
  brief: null,
  activityLog: [],
  competitors: [],
  dominantPattern: '',
  opportunity: '',
  componentCode: null,
  screens: [],
  selectedScreen: 0,
  phase: 'vibe' as const,
  model: 'gemini-2.5-flash' as const,
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initial,
      hasHydrated: false,
      globalError: null,
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      setBrief: (b) => set({ brief: b }),
      addLog: (line) => set((s) => ({ activityLog: [...s.activityLog, line] })),
      setResult: (d) => {
        // Prefer the multi-screen array; fall back to wrapping a single
        // component (older backend / older persisted session).
        const screens =
          d.screens && d.screens.length > 0
            ? d.screens
            : d.component_code
              ? [{ name: 'Screen 1', code: d.component_code }]
              : []
        set({
          competitors: d.competitors,
          dominantPattern: d.dominant_pattern,
          opportunity: d.opportunity,
          screens,
          selectedScreen: 0,
          componentCode: screens[0]?.code ?? d.component_code,
        })
      },
      setSelectedScreen: (i) => set({ selectedScreen: i }),
      setPhase: (p) => set({ phase: p }),
      reset: () => set(initial),
      // Re-run research/generation for the same brief — used by the
      // "Regenerate variation" action on the result page. Deliberately
      // leaves `componentCode` as-is (it gets overwritten once the new
      // build finishes) rather than nulling it: the result page is still
      // mounted for a moment during this navigation, and its own
      // `!componentCode` redirect-to-home guard would otherwise fire and
      // race the router.push('/research') call below.
      regenerate: () =>
        set({
          activityLog: [],
          competitors: [],
          dominantPattern: '',
          opportunity: '',
          phase: 'research',
        }),
      // NB: screens/componentCode intentionally left as-is during regenerate
      // for the same redirect-race reason above.
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setModel: (m) => set({ model: m }),
      setGlobalError: (message) => set({ globalError: message }),
    }),
    {
      name: 'vibeui-session',
      storage: createJSONStorage(() => sessionStorage),
      // We hydrate manually (see StoreHydration.tsx) after React has
      // mounted, so the server-rendered markup and the first client
      // render always agree — avoids hydration mismatches.
      skipHydration: true,
      partialize: (s) => ({
        messages: s.messages,
        brief: s.brief,
        activityLog: s.activityLog,
        competitors: s.competitors,
        dominantPattern: s.dominantPattern,
        opportunity: s.opportunity,
        componentCode: s.componentCode,
        screens: s.screens,
        selectedScreen: s.selectedScreen,
        phase: s.phase,
        model: s.model,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
