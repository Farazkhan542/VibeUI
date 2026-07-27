import JSZip from 'jszip'
import type { DesignBrief, Screen } from './types'
import { slugify } from './slug'

// A generated screen isn't guaranteed to have a default export (the prompt
// asks for one but doesn't enforce a name) — detect the component name and
// add a default export if missing, same assumption ComponentPreview makes.
function ensureDefaultExport(code: string): string {
  if (/export\s+default/.test(code)) return code
  const match = code.match(/(?:function|const)\s+([A-Z]\w*)/)
  const name = match ? match[1] : 'App'
  return `${code}\nexport default ${name};`
}

// Bundles the generated screens into a minimal, runnable Vite + React +
// TypeScript project and downloads it as a zip. Each screen is its own file
// under src/screens/, and App.tsx switches between them with a small nav.
// Tailwind is loaded via CDN in index.html (the same trick the live preview
// uses) so the scaffold renders with zero build configuration.
export async function exportProject(screens: Screen[], brief: DesignBrief | null) {
  const name = brief ? slugify(brief.niche || brief.industry) : 'vibeui-project'
  const title = brief ? `${brief.industry} — ${brief.niche}` : 'VibeUI project'

  // Stable, unique file slug per screen (index-prefixed to avoid collisions).
  const files = screens.map((s, i) => ({
    name: s.name,
    fileSlug: `${i + 1}-${slugify(s.name) || 'screen'}`,
    importId: `Screen${i}`,
    code: ensureDefaultExport(s.code),
  }))

  const zip = new JSZip()

  zip.file(
    'package.json',
    JSON.stringify(
      {
        name,
        private: true,
        version: '0.1.0',
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
        dependencies: {
          react: '^19.2.4',
          'react-dom': '^19.2.4',
          // Import-free is instructed, but keep these as a safety net so a
          // stray icon-library import doesn't break `npm install`.
          '@heroicons/react': '^2.2.0',
          'lucide-react': '^0.469.0',
        },
        devDependencies: {
          '@vitejs/plugin-react': '^4.3.4',
          typescript: '^5.7.3',
          vite: '^6.0.7',
        },
      },
      null,
      2
    )
  )

  zip.file(
    'vite.config.ts',
    `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`
  )

  zip.file(
    'tsconfig.json',
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
        },
        include: ['src'],
      },
      null,
      2
    )
  )

  zip.file(
    'index.html',
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <!-- Tailwind via CDN so this runs with zero build config -->
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`
  )

  zip.file(
    'src/main.tsx',
    `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
`
  )

  // Each screen as its own module.
  for (const f of files) {
    zip.file(`src/screens/${f.fileSlug}.tsx`, f.code)
  }

  // App.tsx — imports every screen and (when there's more than one) shows a
  // small floating nav to switch between them.
  const imports = files.map((f) => `import ${f.importId} from './screens/${f.fileSlug}'`).join('\n')
  const list = files.map((f) => `  { name: '${f.name.replace(/'/g, "\\'")}', Component: ${f.importId} },`).join('\n')
  const appCode = `import { useState } from 'react'
${imports}

const SCREENS = [
${list}
]

export default function App() {
  const [active, setActive] = useState(0)
  const Current = SCREENS[active].Component
  return (
    <>
      {SCREENS.length > 1 && (
        <nav
          style={{
            position: 'fixed',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            gap: 6,
            padding: 6,
            borderRadius: 999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {SCREENS.map((s, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                border: 'none',
                borderRadius: 999,
                padding: '6px 14px',
                fontSize: 12,
                cursor: 'pointer',
                background: i === active ? '#fff' : 'transparent',
                color: i === active ? '#000' : '#fff',
              }}
            >
              {s.name}
            </button>
          ))}
        </nav>
      )}
      <Current />
    </>
  )
}
`
  zip.file('src/App.tsx', appCode)

  const briefLines = brief
    ? [
        `- Industry: ${brief.industry} — ${brief.niche}`,
        `- Target user: ${brief.target_user}`,
        `- Feeling: ${brief.feeling}`,
        `- Color mood: ${brief.color_mood}`,
        `- Layout: ${brief.layout_density}`,
        `- Typography: ${brief.typography_feel}`,
      ].join('\n')
    : ''

  const screenList = files.map((f) => `- \`src/screens/${f.fileSlug}.tsx\` — ${f.name}`).join('\n')

  zip.file(
    'README.md',
    `# ${title}

Generated by [VibeUI](https://github.com/Farazkhan542/VibeUI) from this design brief:

${briefLines}

## Screens

${screenList}

Switch between them with the nav at the top of the running app.

## Run it

\`\`\`bash
npm install
npm run dev
\`\`\`

Tailwind is loaded via CDN in \`index.html\`, so there's no build-config step required to see styles.
`
  )

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}-vibeui-project.zip`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
