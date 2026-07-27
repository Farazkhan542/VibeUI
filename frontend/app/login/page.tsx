'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const supabase = createClient()

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        router.push('/app')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('signin')
      }
    }
    setLoading(false)
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }}>
        <span
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--accent)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          VIBEUI
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--text)',
            marginTop: 20,
            marginBottom: 24,
          }}
        >
          {mode === 'signin' ? 'Sign in' : 'Create an account'}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={inputStyle}
          />

          {message && (
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: '#ff8888', lineHeight: 1.5 }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--accent)',
              color: '#0A0A0A',
              border: 'none',
              borderRadius: 6,
              padding: '12px 20px',
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginTop: 8,
            }}
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setMessage(null)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 16,
          }}
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '12px 14px',
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: 14,
  color: 'var(--text)',
  outline: 'none',
}
