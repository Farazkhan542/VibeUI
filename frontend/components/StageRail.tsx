'use client'

import { motion } from 'framer-motion'
import type { Phase } from '@/lib/types'

const stages = [
  { label: 'Vibe' },
  { label: 'Research' },
  { label: 'Render' },
]

export default function StageRail({ phase }: { phase: Phase }) {
  const activeIndex = phase === 'vibe' ? 0 : phase === 'research' ? 1 : 2

  return (
    <div
      style={{
        position: 'fixed',
        right: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        zIndex: 50,
      }}
    >
      {stages.map((s, i) => (
        <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {i === activeIndex ? (
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(232,255,71,0.5)',
                  '0 0 0 6px rgba(232,255,71,0)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
              }}
            />
          ) : (
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: i < activeIndex ? 'var(--accent)' : 'var(--border)',
                opacity: i < activeIndex ? 0.4 : 1,
              }}
            />
          )}
          <span
            style={{
              fontSize: 10,
              fontFamily: 'var(--font-dm-sans), sans-serif',
              color: i === activeIndex ? 'var(--accent)' : 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  )
}
