'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'
import StageRail from '@/components/StageRail'
import TopNav from '@/components/TopNav'
import { exportComponent } from '@/lib/exportComponent'
import { exportProject } from '@/lib/exportProject'

// Load Sandpack client-side only
const ComponentPreview = dynamic(() => import('@/components/ComponentPreview'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: '660px',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-dm-sans), sans-serif',
        fontSize: '13px',
      }}
    >
      Loading preview...
    </div>
  ),
})

export default function ResultPage() {
  const router = useRouter()
  const {
    brief,
    competitors,
    dominantPattern,
    opportunity,
    componentCode,
    screens,
    selectedScreen,
    setSelectedScreen,
    reset,
    regenerate,
    phase,
    hasHydrated,
  } = useStore()
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Normalize: prefer the multi-screen array, fall back to the single
  // component (older sessions) so nothing here has to special-case it.
  const activeScreens =
    screens.length > 0
      ? screens
      : componentCode
        ? [{ name: 'Screen 1', code: componentCode }]
        : []
  const current = activeScreens[selectedScreen] ?? activeScreens[0]

  useEffect(() => {
    if (!hasHydrated) return
    if (!componentCode && screens.length === 0) {
      router.replace('/app')
    }
  }, [hasHydrated, componentCode, screens.length])

  function handleRegenerate() {
    regenerate()
    router.push('/research')
  }

  function handleCopy() {
    if (!current) return
    navigator.clipboard.writeText(current.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    if (!current) return
    exportComponent(current.code, brief, current.name)
  }

  async function handleExportProject() {
    if (activeScreens.length === 0 || exporting) return
    setExporting(true)
    try {
      await exportProject(activeScreens, brief)
    } finally {
      setExporting(false)
    }
  }

  function handleStartOver() {
    reset()
    router.push('/app')
  }

  if (activeScreens.length === 0) return null

  return (
    <div
      style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}
    >
      <TopNav />

      <StageRail phase={phase} />

      <div className="flex h-screen pt-16" style={{ paddingRight: '60px' }}>
        {/* Left — Research Card (25%) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-y-auto px-6 py-6"
          style={{ width: '25%', borderRight: '1px solid var(--border)' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '20px',
            }}
          >
            Market Research
          </h2>

          {/* Competitor pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {competitors.map((url) => {
              const domain = url.replace(/^https?:\/\//, '').split('/')[0]
              return (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    backgroundColor: 'var(--surface-hi)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '12px',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--accent)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = 'var(--border)')
                  }
                >
                  {domain}
                </a>
              )
            })}
          </div>

          {/* Patterns */}
          <div className="space-y-4">
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '6px',
                }}
              >
                What everyone does:
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '13px',
                  color: 'var(--text)',
                  lineHeight: 1.6,
                }}
              >
                {dominantPattern}
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: '6px',
                }}
              >
                The opportunity:
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '13px',
                  color: 'var(--accent)',
                  lineHeight: 1.6,
                }}
              >
                {opportunity}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Center — Component Preview (50%) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="px-6 py-6 overflow-y-auto"
          style={{ width: '50%', borderRight: '1px solid var(--border)' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '16px',
            }}
          >
            {activeScreens.length > 1 ? 'Screens' : 'Component'}
          </h2>

          {/* Screen switcher */}
          {activeScreens.length > 1 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {activeScreens.map((s, i) => {
                const active = i === selectedScreen
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedScreen(i)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      backgroundColor: active ? 'var(--accent)' : 'transparent',
                      color: active ? '#0A0A0A' : 'var(--text-muted)',
                      fontFamily: 'var(--font-dm-sans), sans-serif',
                      fontSize: 12,
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {s.name}
                  </button>
                )
              })}
            </div>
          )}

          <ComponentPreview key={selectedScreen} code={current.code} />
        </motion.div>

        {/* Right — Actions (25%) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="px-6 py-6 flex flex-col"
          style={{ width: '25%' }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '20px',
            }}
          >
            Actions
          </h2>

          <div className="flex flex-col gap-3">
            {/* Copy Code */}
            <button
              onClick={handleCopy}
              style={{
                backgroundColor: 'var(--accent)',
                color: '#0A0A0A',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 20px',
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {copied ? 'Copied ✓' : 'Copy Code'}
            </button>

            {/* Regenerate */}
            <button
              onClick={handleRegenerate}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
                borderRadius: '6px',
                padding: '12px 20px',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Regenerate Variation
            </button>

            {/* Download component file */}
            <button
              onClick={handleDownload}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px 20px',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-muted)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              Download .tsx
            </button>

            {/* Export full mini-project */}
            <button
              onClick={handleExportProject}
              disabled={exporting}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px 20px',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                cursor: exporting ? 'default' : 'pointer',
                textAlign: 'center',
                opacity: exporting ? 0.6 : 1,
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (exporting) return
                e.currentTarget.style.borderColor = 'var(--text-muted)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              {exporting ? 'Zipping…' : 'Export Project (.zip)'}
            </button>

            {/* Start Over */}
            <button
              onClick={handleStartOver}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '12px 20px',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-muted)'
                e.currentTarget.style.color = 'var(--text)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              Start Over
            </button>
          </div>

          {/* Badge strip */}
          <div
            className="mt-auto pt-8 flex flex-col gap-2"
          >
            {['Gemini 2.5 Pro', 'Stitch MCP', 'Tailwind CSS'].map((badge) => (
              <span
                key={badge}
                style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  width: 'fit-content',
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
