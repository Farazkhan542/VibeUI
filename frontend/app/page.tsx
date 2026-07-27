'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import Footer from '@/components/Footer'

const STEPS = [
  {
    n: '01',
    title: 'Vibe interview',
    body: 'A short, conversational intake — what you\'re building, a design reference, your target user, the feeling you want. No forms, no jargon.',
  },
  {
    n: '02',
    title: 'Live competitor research',
    body: 'Gemini searches the real web for 3–5 actual competitors in your niche, analyzes their color, type, and layout patterns, and finds one overused pattern and one opportunity to stand out.',
  },
  {
    n: '03',
    title: 'Instant component',
    body: 'A complete, self-contained React + Tailwind component built to match your brief and that opportunity — rendered live, ready to copy, download, or export as a runnable project.',
  },
]

const FEATURES = [
  {
    title: 'Bring your own key',
    body: 'Log in and add your own Gemini API key — encrypted at rest, resolved per request, never shared. This isn\'t a shared-key demo one person\'s traffic can drain.',
  },
  {
    title: 'Project history',
    body: 'Every generation is saved to your account and browsable later. Reopen any past result and its live preview whenever you want.',
  },
  {
    title: 'Live sandboxed preview',
    body: 'See the generated component rendered in a real sandbox, with a code tab — not a screenshot, not a mockup.',
  },
  {
    title: 'Copy, download, export',
    body: 'Take the code as a single .tsx file, copy it to your clipboard, or export a complete runnable Vite + React + TypeScript project as a zip.',
  },
  {
    title: 'Pick your model',
    body: 'Choose between Gemini 2.5 Flash for speed or 2.5 Pro for higher-quality generations, per your account.',
  },
  {
    title: 'Real research, not templates',
    body: 'Every component is grounded in live search of your actual market — differentiated from what competitors are already doing.',
  },
]

const TECH = [
  'Next.js 16',
  'React 19',
  'TypeScript',
  'FastAPI',
  'Gemini 2.5',
  'Supabase',
  'Tailwind CSS',
  'Sandpack',
]

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-syne), sans-serif',
  color: 'var(--text)',
  letterSpacing: '-0.02em',
}
const body: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans), sans-serif',
  color: 'var(--text-muted)',
  lineHeight: 1.6,
}

function LaunchButton({ primary }: { primary?: boolean }) {
  return (
    <Link
      href="/app"
      style={{
        display: 'inline-block',
        backgroundColor: primary ? 'var(--accent)' : 'transparent',
        color: primary ? '#0A0A0A' : 'var(--text)',
        border: primary ? 'none' : '1px solid var(--border)',
        borderRadius: 8,
        padding: '12px 22px',
        fontFamily: 'var(--font-syne), sans-serif',
        fontSize: 14,
        fontWeight: 700,
        textDecoration: 'none',
        letterSpacing: '0.01em',
      }}
    >
      Launch app →
    </Link>
  )
}

export default function Landing() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Nav */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(10,10,10,0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-syne), sans-serif',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--accent)',
              letterSpacing: '0.08em',
            }}
          >
            VIBEUI
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <a
              href="https://github.com/Farazkhan542/VibeUI"
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...body, fontSize: 13, textDecoration: 'none' }}
            >
              GitHub
            </a>
            <Link
              href="/app"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#0A0A0A',
                borderRadius: 6,
                padding: '8px 16px',
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Launch app
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span
            style={{
              ...body,
              display: 'inline-block',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--accent)',
              marginBottom: 24,
            }}
          >
            AI UI generation, grounded in real research
          </span>
          <h1 style={{ ...heading, fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24 }}>
            Turn a conversation into a<br />
            <span style={{ color: 'var(--accent)' }}>real UI component.</span>
          </h1>
          <p style={{ ...body, fontSize: 18, maxWidth: 620, margin: '0 auto 36px' }}>
            VibeUI interviews you about your product, researches your actual
            competitors live on the web, and generates a production-ready React
            component matched to your brief — not a generic template.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <LaunchButton primary />
            <a
              href="https://github.com/Farazkhan542/VibeUI"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 22px',
                fontFamily: 'var(--font-syne), sans-serif',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              View source
            </a>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ ...heading, fontSize: 28, fontWeight: 700, marginBottom: 40, textAlign: 'center' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 24,
              }}
            >
              <span style={{ ...heading, fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{s.n}</span>
              <h3 style={{ ...heading, fontSize: 18, fontWeight: 700, margin: '12px 0 8px' }}>{s.title}</h3>
              <p style={{ ...body, fontSize: 14 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ ...heading, fontSize: 28, fontWeight: 700, marginBottom: 40, textAlign: 'center' }}>
          Built like a product, not a demo
        </h2>
        <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 18 }}>
              <h3 style={{ ...heading, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ ...body, fontSize: 14 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ ...body, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 24 }}>
          Built with
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {TECH.map((t) => (
            <span
              key={t}
              style={{
                ...body,
                fontSize: 13,
                color: 'var(--text)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 999,
                padding: '6px 14px',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: '48px 24px',
          }}
        >
          <h2 style={{ ...heading, fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Generate your first component
          </h2>
          <p style={{ ...body, fontSize: 15, maxWidth: 460, margin: '0 auto 28px' }}>
            Bring your own Gemini API key and go from a four-question chat to a
            rendered component in under a minute.
          </p>
          <LaunchButton primary />
        </div>
      </section>

      <Footer />
    </div>
  )
}
