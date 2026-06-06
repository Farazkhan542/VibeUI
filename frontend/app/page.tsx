'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import VibeChat from '@/components/VibeChat'
import StageRail from '@/components/StageRail'

export default function Home() {
  const router = useRouter()
  const phase = useStore((s) => s.phase)

  function handleBriefReady() {
    router.push('/research')
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      {/* Wordmark */}
      <div
        className="fixed top-6 left-6"
        style={{ zIndex: 50 }}
      >
        <span
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          VIBEUI
        </span>
      </div>

      {/* Stage rail */}
      <StageRail phase={phase} />

      {/* Chat */}
      <VibeChat onBriefReady={handleBriefReady} />
    </div>
  )
}
