'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  lines: string[]
  done: boolean
}

export default function ActivityLog({ lines, done }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div
      className="h-full overflow-y-auto p-6"
      style={{
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: '13px',
      }}
    >
      <AnimatePresence initial={false}>
        {lines.map((line, i) => {
          const isDone = line === 'Done'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="flex items-start gap-2 mb-2"
            >
              <span
                style={{
                  color: isDone ? 'var(--accent)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                {isDone ? '✓' : '▸'}
              </span>
              <span
                style={{
                  color: isDone ? 'var(--accent)' : 'var(--text)',
                  lineHeight: 1.6,
                }}
              >
                {line}
              </span>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {!done && lines.length > 0 && (
        <motion.div
          className="flex gap-1 mt-2 ml-5"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: 'var(--text-muted)',
                display: 'inline-block',
              }}
            />
          ))}
        </motion.div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
