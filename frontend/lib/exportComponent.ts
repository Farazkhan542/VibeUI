import type { DesignBrief } from './types'
import { slugify, downloadBlob } from './slug'

// Downloads the generated component as a single standalone .tsx file.
export function exportComponent(componentCode: string, brief: DesignBrief | null) {
  const base = brief ? slugify(brief.niche || brief.industry) : 'vibeui-component'
  downloadBlob(`${base}.tsx`, componentCode, 'text/plain;charset=utf-8')
}
