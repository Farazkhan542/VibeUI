'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { useStore } from '@/lib/store'

// Present on every authenticated page so there's always a way to reach
// Projects/Settings/Sign-out and to start a fresh project — previously
// "Start Over" only existed on the /result page, so navigating away any
// other way left you stuck with a finished conversation and no reset.
export default function TopNav() {
  const router = useRouter()
  const reset = useStore((s) => s.reset)

  async function handleSignOut() {
    await createClient().auth.signOut()
    router.push('/login')
  }

  function handleNewProject() {
    reset()
    router.push('/app')
  }

  const linkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-dm-sans), sans-serif',
    fontSize: 12,
    color: 'var(--text-muted)',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  }

  return (
    <div className="fixed top-6 left-6 flex items-center" style={{ zIndex: 50, gap: 20 }}>
      <Link
        href="/app"
        style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        VIBEUI
      </Link>

      <button onClick={handleNewProject} style={linkStyle}>
        New Project
      </button>
      <Link href="/projects" style={linkStyle}>
        Projects
      </Link>
      <Link href="/settings" style={linkStyle}>
        Settings
      </Link>
      <button onClick={handleSignOut} style={linkStyle}>
        Sign out
      </button>
    </div>
  )
}
