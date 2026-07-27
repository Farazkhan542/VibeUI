'use client'

// Footer links. To add LinkedIn later, add
// { label: 'LinkedIn', href: '<your-linkedin-url>' } to LINKS.
const LINKS = [
  { label: 'Portfolio', href: 'https://faraz-khan.xyz' },
  { label: 'GitHub', href: 'https://github.com/Farazkhan542/VibeUI' },
]

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '40px 24px',
        marginTop: 80,
      }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          Built by{' '}
          <a
            href="https://faraz-khan.xyz"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text)', textDecoration: 'none' }}
          >
            Faraz Khan
          </a>
        </p>

        <div style={{ display: 'flex', gap: 24 }}>
          {LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-dm-sans), sans-serif',
                fontSize: 13,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
