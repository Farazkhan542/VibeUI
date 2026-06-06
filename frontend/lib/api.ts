import type { Message, DesignBrief } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function sendMessage(messages: Message[]) {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`)
  return res.json()
}

export function startBuild(
  brief: DesignBrief,
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ brief }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`Build API error: ${res.status}`)
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
