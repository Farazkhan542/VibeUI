'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useStore } from '@/lib/store'
import { createClient } from '@/lib/supabaseClient'
import VibeChat from '@/components/VibeChat'
import StageRail from '@/components/StageRail'

export default function Home() {
  const router = useRouter()
  const phase = useStore((s) => s.phase)

  function handleBriefReady() {
    router.push('/research')
  }

  async function handleSignOut() {
    await createClient().auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}>
      {/* Wordmark + nav */}
      <div
        className="fixed top-6 left-6 flex items-center"
        style={{ zIndex: 50, gap: 20 }}
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

        {[
          { href: '/projects', label: 'Projects' },
          { href: '/settings', label: 'Settings' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            {link.label}
          </Link>
        ))}

        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: 'none',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 12,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Sign out
        </button>
      </div>

      {/* Stage rail */}
      <StageRail phase={phase} />

      {/* Chat */}
      <VibeChat onBriefReady={handleBriefReady} />
    </div>
  )
}
