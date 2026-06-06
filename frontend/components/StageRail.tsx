'use client'

import { motion } from 'framer-motion'
import type { Phase } from '@/lib/types'

const stages: { key: Phase | 'done'; label: string }[] = [
  { key: 'vibe', label: 'Vibe' },
  { key: 'research', label: 'Research' },
  { key: 'done', label: 'Render' },
]

export default function StageRail({ phase }: { phase: Phase }) {
  const activeIndex = phase === 'vibe' ? 0 : phase === 'research' ? 1 : 2

  return (
    <div
      className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-6"
      style={{ zIndex: 50 }}
    >
      {stages.map((s, i) => (
        <div key={s.key} className="flex flex-col items-center gap-1">
          <motion.div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor:
                i === activeIndex ? 'var(--accent)' : 'var(--border)',
            }}
            animate={
              i === activeIndex
                ? {
                    boxShadow: [
                      '0 0 0 0 rgba(232,255,71,0.4)',
                      '0 0 0 8px rgba(232,255,71,0)',
                    ],
                  }
                : {}
            }
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
          <span
            style={{
              fontSize: '10px',
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
