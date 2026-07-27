'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabaseClient'
import type { DesignBrief, Screen } from '@/lib/types'
import TopNav from '@/components/TopNav'

const ComponentPreview = dynamic(() => import('@/components/ComponentPreview'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 560,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-dm-sans), sans-serif',
        fontSize: 13,
      }}
    >
      Loading preview...
    </div>
  ),
})

interface ProjectRow {
  id: string
  brief: DesignBrief
  competitors: string[]
  dominant_pattern: string
  opportunity: string
  component_code: string
  screens: Screen[] | null
  model: string
  created_at: string
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectRow | null | undefined>(undefined)
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('projects')
      .select('id, brief, competitors, dominant_pattern, opportunity, component_code, screens, model, created_at')
      .eq('id', id)
      .single()
      .then(({ data }) => setProject((data as ProjectRow) ?? null))
  }, [id])

  if (project === undefined) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '80px 24px' }}>
        <TopNav />
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>Loading…</p>
      </div>
    )
  }

  if (project === null) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '80px 24px' }}>
        <TopNav />
        <Link href="/projects" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
          ← Back to projects
        </Link>
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
          Project not found.
        </p>
      </div>
    )
  }

  // Older rows have only component_code; newer ones carry a screens array.
  const screens: Screen[] =
    project.screens && project.screens.length > 0
      ? project.screens
      : project.component_code
        ? [{ name: 'Screen 1', code: project.component_code }]
        : []
  const current = screens[selected] ?? screens[0]

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <TopNav />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}>
        <Link href="/projects" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
          ← Back to projects
        </Link>

        <h1
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text)',
            margin: '20px 0 4px',
          }}
        >
          {project.brief.industry} — {project.brief.niche}
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
          {new Date(project.created_at).toLocaleString()} · {project.model}
        </p>

        {screens.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {screens.map((s, i) => {
              const active = i === selected
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
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
                  }}
                >
                  {s.name}
                </button>
              )
            })}
          </div>
        )}

        {current && <ComponentPreview key={selected} code={current.code} />}
      </div>
    </div>
  )
}
