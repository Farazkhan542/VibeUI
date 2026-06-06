'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'
import StageRail from '@/components/StageRail'

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
  const { competitors, dominantPattern, opportunity, componentCode, reset, phase } =
    useStore()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!componentCode) {
      router.replace('/')
    }
  }, [])

  function handleCopy() {
    if (!componentCode) return
    navigator.clipboard.writeText(componentCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleStartOver() {
    reset()
    router.push('/')
  }

  if (!componentCode) return null

  return (
    <div
      style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', position: 'relative' }}
    >
      {/* Wordmark */}
      <div className="fixed top-6 left-6" style={{ zIndex: 50 }}>
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
              marginBottom: '20px',
            }}
          >
            Component
          </h2>
          <ComponentPreview code={componentCode} />
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
