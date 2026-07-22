'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { startBuild } from '@/lib/api'
import { createClient } from '@/lib/supabaseClient'
import ActivityLog from '@/components/ActivityLog'
import StageRail from '@/components/StageRail'

export default function ResearchPage() {
  const router = useRouter()
  const { brief, activityLog, addLog, setResult, setPhase, phase, reset, hasHydrated, model } =
    useStore()
  const [hasError, setHasError] = useState(false)
  const started = useRef(false)

  function runBuild() {
    if (!brief) return
    setHasError(false)
    started.current = true

    startBuild(
      brief,
      model,
      (msg) => addLog(msg),
      (data) => {
        setResult(data)
        setPhase('done')
        // Save to the account's project history — best-effort, doesn't
        // block navigation if it fails.
        createClient()
          .from('projects')
          .insert({
            brief,
            competitors: data.competitors,
            dominant_pattern: data.dominant_pattern,
            opportunity: data.opportunity,
            component_code: data.component_code,
            model,
          })
          .then(({ error }) => {
            if (error) console.error('Failed to save project history:', error.message)
          })
        setTimeout(() => router.push('/result'), 600)
      },
      (err) => {
        addLog(`Error: ${err}`)
        setHasError(true)
      }
    )
  }

  useEffect(() => {
    if (!hasHydrated) return
    if (!brief) {
      router.replace('/')
      return
    }
    if (!started.current) {
      runBuild()
    }
  }, [hasHydrated])

  const done = activityLog.includes('Done')

  const briefRows = brief
    ? [
        { label: 'Industry', value: `${brief.industry} — ${brief.niche}` },
        { label: 'Vibe Ref', value: brief.vibe_reference || '—' },
        { label: 'Feeling', value: brief.feeling },
        { label: 'Target User', value: brief.target_user },
        { label: 'Color Mood', value: brief.color_mood },
        { label: 'Layout', value: brief.layout_density },
        { label: 'Typography', value: brief.typography_feel },
      ]
    : []

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

      <div className="flex h-screen pt-16">
        {/* Left — Activity Log (60%) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 overflow-hidden"
          style={{
            width: '60%',
            borderRight: '1px solid var(--border)',
          }}
        >
          <div className="px-8 py-6">
            <p
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: '12px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '20px',
              }}
            >
              Research Log
            </p>
          </div>
          <div style={{ height: 'calc(100vh - 140px)' }}>
            <ActivityLog lines={activityLog} done={done} />
          </div>
        </motion.div>

        {/* Right — Brief Summary Card (40%) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="overflow-y-auto px-8 py-6"
          style={{ width: '40%' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: '12px',
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            Design Brief
          </p>

          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {briefRows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '12px 16px',
                  borderBottom:
                    i < briefRows.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    minWidth: '90px',
                    paddingTop: '1px',
                  }}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '13px',
                    color: 'var(--text)',
                    lineHeight: 1.5,
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Status feedback */}
          {done && !hasError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <span
                style={{
                  fontFamily: 'var(--font-syne), sans-serif',
                  fontSize: '13px',
                  color: 'var(--accent)',
                }}
              >
                Navigating to result...
              </span>
            </motion.div>
          )}

          {hasError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-col gap-3"
            >
              <p
                style={{
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  fontSize: '13px',
                  color: '#ff5555',
                }}
              >
                Something went wrong. Check that your GEMINI_API_KEY is set.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    started.current = false
                    runBuild()
                  }}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#0A0A0A',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Retry
                </button>
                <button
                  onClick={() => {
                    reset()
                    router.push('/')
                  }}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
