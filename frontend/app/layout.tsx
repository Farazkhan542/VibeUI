import type { Metadata } from 'next'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'
import StoreHydration from '@/components/StoreHydration'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: 'VibeUI — Design Intelligence',
  description: 'AI-powered UI generation from a 4-question vibe interview',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} h-full`}>
      <body
        className="min-h-full"
        style={{
          fontFamily: 'var(--font-dm-sans), sans-serif',
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
        }}
        suppressHydrationWarning
      >
        <StoreHydration />
        {children}
      </body>
    </html>
  )
}
