'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import VibeChat from '@/components/VibeChat'
import StageRail from '@/components/StageRail'
import TopNav from '@/components/TopNav'

export default function AppHome() {
  const router = useRouter()
  const phase = useStore((s) => s.phase)

  function handleBriefReady() {
    router.push('/research')
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      <TopNav />
      <StageRail phase={phase} />
      <VibeChat onBriefReady={handleBriefReady} />
    </div>
  )
}
