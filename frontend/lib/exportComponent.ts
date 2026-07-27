import type { DesignBrief } from './types'
import { slugify, downloadBlob } from './slug'

// Downloads a single screen's component as a standalone .tsx file, named
// after the brief + the screen (e.g. coffee-roastery-dashboard.tsx).
export function exportComponent(code: string, brief: DesignBrief | null, screenName?: string) {
  const base = brief ? slugify(brief.niche || brief.industry) : 'vibeui-component'
  const suffix = screenName ? `-${slugify(screenName)}` : ''
  downloadBlob(`${base}${suffix}.tsx`, code, 'text/plain;charset=utf-8')
}
