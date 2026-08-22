import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Chivo, Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const chivo = Chivo({
  subsets: ['latin'],
  variable: '--font-chivo',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AUDEXIFY — AI-Powered Web Accessibility Intelligence',
  description:
    'Audit any website for accessibility issues with deterministic axe-core detection, custom ML classification, and grounded AI remediation guidance mapped to WCAG.',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#08090B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-[#08090B]">
      <body
        className={`${chivo.variable} ${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary`}
      >
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
