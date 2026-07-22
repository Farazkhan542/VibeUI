import type { Message, DesignBrief } from './types'
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
    component_code: string
  }) => void,
  onError: (err: string) => void
) {
  fetch(`${BASE}/api/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: JSON.stringify({ brief, model }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(await errorDetail(res, `Build API error: ${res.status}`))
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let lastEvent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            lastEvent = line.slice(7).trim()
            continue
          }
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (!data) continue

            if (lastEvent === 'error') {
              onError(data)
              return
            }
            if (lastEvent === 'done') {
              try {
                const parsed = JSON.parse(data)
                onDone(parsed)
              } catch {
                onError('Failed to parse result')
              }
              return
            }
            if (lastEvent === 'activity') {
              onActivity(data)
            } else {
              // Fallback: try JSON parse for done, otherwise treat as activity
              try {
                const parsed = JSON.parse(data)
                if (parsed.component_code) {
                  onDone(parsed)
                  return
                }
              } catch {
                onActivity(data)
              }
            }
          }
        }
      }
    })
    .catch((err) => onError(err.message))
}
