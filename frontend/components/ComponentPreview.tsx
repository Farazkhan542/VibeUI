'use client'

import { useState } from 'react'
import {
  SandpackProvider,
  SandpackPreview,
  SandpackCodeEditor,
} from '@codesandbox/sandpack-react'

interface Props {
  code: string
}

function wrapCode(code: string): string {
  // Ensure Tailwind play CDN is injected, and the component is exported as default App
  const hasDefaultExport = /export\s+default/.test(code)
  const wrapped = hasDefaultExport ? code : `${code}\nexport default App;`

  // Prepend a tiny Tailwind CDN injector so classes render inside the iframe
  return `
import { useEffect } from 'react';
function TailwindInjector() {
  useEffect(() => {
    if (!document.getElementById('tw-cdn')) {
      const s = document.createElement('script');
      s.id = 'tw-cdn';
      s.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(s);
    }
  }, []);
  return null;
}

${wrapped.replace(/export\s+default\s+(\w+)/, (_, name) => {
  return `
const _OriginalComponent = ${name};
export default function App() {
  return (
    <>
      <TailwindInjector />
      <_OriginalComponent />
    </>
  );
}`
})}
`.trim()
}

const THEME = {
  colors: {
    surface1: '#111111',
    surface2: '#1A1A1A',
    surface3: '#222222',
    clickable: '#888888',
    base: '#F0F0F0',
    disabled: '#333333',
    hover: '#E8FF47',
    accent: '#E8FF47',
    error: '#ff5555',
    errorSurface: '#1A1A1A',
  },
  syntax: {
    plain: '#F0F0F0',
    comment: { color: '#555555', fontStyle: 'italic' as const },
    keyword: '#E8FF47',
    tag: '#88CCFF',
    punctuation: '#888888',
    definition: '#88CCFF',
    property: '#F0F0F0',
    static: '#FFB86C',
    string: '#98C379',
  },
  font: {
    body: 'DM Sans, sans-serif',
    mono: 'JetBrains Mono, monospace',
    size: '13px',
    lineHeight: '1.6',
  },
}

export default function ComponentPreview({ code }: Props) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview')

  return (
    <div style={{ border: '1px solid #2A2A2A', borderRadius: 8, overflow: 'hidden', backgroundColor: '#111' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2A2A2A', backgroundColor: '#111' }}>
        {(['preview', 'code'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid #E8FF47' : '2px solid transparent',
              color: tab === t ? '#F0F0F0' : '#555555',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 12,
              fontWeight: tab === t ? 500 : 400,
              cursor: 'pointer',
              textTransform: 'capitalize',
              letterSpacing: '0.04em',
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <SandpackProvider
        template="react"
        files={{ '/App.js': { code: wrapCode(code), active: true } }}
        theme={THEME}
        options={{ autorun: true, autoReload: true }}
      >
        <div style={{ display: tab === 'preview' ? 'block' : 'none' }}>
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton={true}
            style={{ height: 560, backgroundColor: '#0A0A0A' }}
          />
        </div>
        <div style={{ display: tab === 'code' ? 'block' : 'none' }}>
          <SandpackCodeEditor
            showTabs={false}
            showLineNumbers={true}
            style={{ height: 560 }}
          />
        </div>
      </SandpackProvider>
    </div>
  )
}
