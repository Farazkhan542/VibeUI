import type { Message, DesignBrief, Screen } from './types'
import { createClient } from './supabaseClient'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function authHeader(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function errorDetail(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    return body?.detail || fallback
  } catch {
    return fallback
  }
}

export async function sendMessage(messages: Message[]) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error(await errorDetail(res, `Chat API error: ${res.status}`))
  return res.json()
}

export async function startBuild(
  brief: DesignBrief,
  model: string,
  onActivity: (msg: string) => void,
  onDone: (data: {
    competitors: string[]
    dominant_pattern: string
    opportunity: string
    screens?: Screen[]
    component_code: string
  }) => void,
  onError: (err: string) => void
) {
  // The backend does research + generation in a single request/response
  // (see the note on /api/build — SSE isn't serverless-friendly), so the
  // progress steps are surfaced here on a timer while that one call runs.
  const steps = [
    `Searching "${brief.niche} best UI examples 2025" ...`,
    'Analyzing competitor UI patterns ...',
    'Identifying opportunity gap ...',
    'Designing your screens ...',
    'Generating components ...',
  ]
  let step = 0
  onActivity(steps[step++])
  const ticker = setInterval(() => {
    if (step < steps.length) onActivity(steps[step++])
  }, 6000)

  try {
    const res = await fetch(`${BASE}/api/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
      body: JSON.stringify({ brief, model }),
    })
    if (!res.ok) throw new Error(await errorDetail(res, `Build API error: ${res.status}`))
    const data = await res.json()
    clearInterval(ticker)
    onActivity('Done')
    onDone(data)
  } catch (err) {
    clearInterval(ticker)
    onError(err instanceof Error ? err.message : 'Build failed')
  }
}
