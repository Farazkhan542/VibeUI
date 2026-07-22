'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

// The store uses `skipHydration` so it never auto-loads sessionStorage
// during React's initial (SSR-matching) render. Once mounted on the
// client, kick off the real rehydration — `onRehydrateStorage` in
// store.ts flips `hasHydrated` to true when it finishes.
export default function StoreHydration() {
  useEffect(() => {
    useStore.persist.rehydrate()
  }, [])

  return null
}
