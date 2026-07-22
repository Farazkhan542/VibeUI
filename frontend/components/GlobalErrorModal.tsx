'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '@/lib/store'

// Rendered once in the root layout so any page can trigger it via
// setGlobalError — used for errors serious enough to interrupt the user
// (e.g. the Gemini API key hitting its quota) rather than just logging
// inline text they might miss.
export default function GlobalErrorModal() {
  const { globalError, setGlobalError } = useStore()

  return (
    <AnimatePresence>
      {globalError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setGlobalError(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 24,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text)',
                marginBottom: 10,
              }}
            >
              Out of API credit
            </p>
            <p
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 13,
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                marginBottom: 20,
              }}
            >
              {globalError}
            </p>
            <button
              onClick={() => setGlobalError(null)}
              style={{
                backgroundColor: 'var(--accent)',
                color: '#0A0A0A',
                border: 'none',
                borderRadius: 6,
                padding: '10px 18px',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
