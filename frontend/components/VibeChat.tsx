'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { sendMessage } from '@/lib/api'
import { isQuotaError } from '@/lib/errors'
import type { Message } from '@/lib/types'

export default function VibeChat({ onBriefReady }: { onBriefReady: () => void }) {
  const { messages, addMessage, setBrief, setPhase, hasHydrated, setGlobalError } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initiated = useRef(false)

  useEffect(() => {
    // Wait for the persisted session to rehydrate first, otherwise a
    // mid-chat refresh would briefly see an empty `messages` array and
    // fire off a duplicate "start" message before history is restored.
    if (!hasHydrated) return
    if (messages.length === 0 && !initiated.current) {
      initiated.current = true
      sendFirstMessage()
    }
  }, [hasHydrated])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendFirstMessage() {
    setLoading(true)
    try {
      const res = await sendMessage([{ role: 'user', content: 'start' }])
      if (res.type === 'message') {
        addMessage({ role: 'assistant', content: res.message })
      }
    } catch (err) {
      // Surface the real reason (e.g. "No Gemini API key saved") instead of
      // silently faking a normal question — otherwise a missing key looks
      // like a working chat until later questions mysteriously fail too.
      const message = err instanceof Error ? err.message : 'Error reaching server.'
      if (isQuotaError(message)) setGlobalError(message)
      addMessage({ role: 'assistant', content: message })
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    addMessage(userMsg)
    setInput('')
    setLoading(true)

    try {
      const allMessages = [...messages, userMsg]
      const res = await sendMessage(allMessages)

      if (res.type === 'brief') {
        setBrief(res.brief)
        setPhase('research')
        addMessage({ role: 'assistant', content: "Got it. Researching your market now..." })
        setTimeout(onBriefReady, 900)
      } else {
        addMessage({ role: 'assistant', content: res.message })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error reaching server. Is the backend running on port 8000?'
      if (isQuotaError(message)) setGlobalError(message)
      addMessage({ role: 'assistant', content: message })
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0A0A0A' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  marginBottom: 28,
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'assistant' ? (
                  <p style={{
                    fontFamily: 'var(--font-syne), Helvetica, sans-serif',
                    fontSize: 22,
                    fontWeight: 500,
                    color: '#F0F0F0',
                    lineHeight: 1.45,
                    maxWidth: '90%',
                  }}>
                    {msg.content}
                  </p>
                ) : (
                  <p style={{
                    fontFamily: 'var(--font-dm-sans), Helvetica, sans-serif',
                    fontSize: 15,
                    color: '#555555',
                    maxWidth: '65%',
                    textAlign: 'right',
                    lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.18 }}
                  style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#555', display: 'inline-block' }}
                />
              ))}
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Fixed input */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        backgroundColor: '#0A0A0A',
        borderTop: '1px solid #2A2A2A',
        padding: '16px 24px',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Say something..."
            disabled={loading}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 17,
              fontFamily: 'var(--font-dm-sans), Helvetica, sans-serif',
              color: '#F0F0F0',
              caretColor: '#E8FF47',
            }}
          />
          <AnimatePresence>
            {input.trim() && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={handleSend}
                disabled={loading}
                style={{
                  backgroundColor: '#E8FF47',
                  color: '#0A0A0A',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                }}
              >
                Send
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
