'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'
import { useStore } from '@/lib/store'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash — fast' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro — higher quality, slower' },
] as const

export default function SettingsPage() {
  const { model, setModel } = useStore()
  const [hasKey, setHasKey] = useState<boolean | null>(null)
  const [keyInput, setKeyInput] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function authHeader() {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    return { Authorization: `Bearer ${data.session?.access_token ?? ''}` }
  }

  async function refreshKeyStatus() {
    const res = await fetch(`${BASE}/api/settings/key/status`, { headers: await authHeader() })
    if (res.ok) {
      const data = await res.json()
      setHasKey(data.hasKey)
    }
  }

  useEffect(() => {
    refreshKeyStatus()

    // Seed the model preference from the account's saved default, once.
    async function loadPreferredModel() {
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      const { data } = await supabase
        .from('profiles')
        .select('preferred_model')
        .eq('id', userData.user.id)
        .single()
      if (data?.preferred_model) setModel(data.preferred_model)
    }
    loadPreferredModel()
  }, [])

  async function handleSaveKey() {
    if (!keyInput.trim()) return
    setSaving(true)
    setMessage(null)
    const res = await fetch(`${BASE}/api/settings/key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify({ api_key: keyInput.trim() }),
    })
    if (res.ok) {
      setKeyInput('')
      setShowKeyInput(false)
      setMessage('Key saved.')
      await refreshKeyStatus()
    } else {
      setMessage('Could not save key — try again.')
    }
    setSaving(false)
  }

  async function handleClearKey() {
    setSaving(true)
    setMessage(null)
    const res = await fetch(`${BASE}/api/settings/key`, {
      method: 'DELETE',
      headers: await authHeader(),
    })
    if (res.ok) {
      setMessage('Key cleared.')
      await refreshKeyStatus()
    }
    setSaving(false)
  }

  async function handleModelChange(value: string) {
    setModel(value as typeof model)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      await supabase.from('profiles').update({ preferred_model: value }).eq('id', userData.user.id)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 24px' }}>
        <Link
          href="/"
          style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}
        >
          ← Back
        </Link>

        <h1
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text)',
            margin: '20px 0 32px',
          }}
        >
          Settings
        </h1>

        {/* Gemini API key */}
        <section style={{ marginBottom: 32 }}>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 10,
            }}
          >
            Gemini API key
          </p>

          {hasKey === null ? (
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
              Checking…
            </p>
          ) : hasKey && !showKeyInput ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--accent)' }}>
                Key saved ✓
              </span>
              <button onClick={() => setShowKeyInput(true)} style={linkButtonStyle}>
                Replace
              </button>
              <button onClick={handleClearKey} disabled={saving} style={linkButtonStyle}>
                Clear
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste your Gemini API key"
                style={{
                  flex: 1,
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '10px 12px',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 13,
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSaveKey}
                disabled={saving}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#0A0A0A',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 16px',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? 'default' : 'pointer',
                }}
              >
                Save
              </button>
            </div>
          )}

          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 12,
              color: 'var(--text-muted)',
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Get a free key at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>
              aistudio.google.com/apikey
            </a>
            . Stored encrypted, tied to your account — never shown again after saving.
          </p>

          {message && (
            <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: 'var(--accent)', marginTop: 8 }}>
              {message}
            </p>
          )}
        </section>

        {/* Model preference */}
        <section>
          <p
            style={{
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              marginBottom: 10,
            }}
          >
            Generation model
          </p>
          <select
            value={model}
            onChange={(e) => handleModelChange(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '10px 12px',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              fontSize: 13,
              color: 'var(--text)',
              outline: 'none',
            }}
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </section>
      </div>
    </div>
  )
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-dm-sans), sans-serif',
  fontSize: 13,
  cursor: 'pointer',
  textDecoration: 'underline',
}
