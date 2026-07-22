'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'
import type { DesignBrief } from '@/lib/types'

interface ProjectRow {
  id: string
  brief: DesignBrief
  model: string
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('projects')
      .select('id, brief, model, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setProjects((data as ProjectRow[]) ?? []))
  }, [])

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
          ← Back
        </Link>

        <h1
          style={{
            fontFamily: 'var(--font-syne), sans-serif',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text)',
            margin: '20px 0 32px',
          }}
        >
          Past projects
        </h1>

        {projects === null && (
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
            Loading…
          </p>
        )}

        {projects?.length === 0 && (
          <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
            No projects yet — generate one from the home page.
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {projects?.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              style={{
                display: 'block',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '14px 16px',
                textDecoration: 'none',
              }}
            >
              <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>
                {p.brief.industry} — {p.brief.niche}
              </p>
              <p style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {new Date(p.created_at).toLocaleString()} · {p.model}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
