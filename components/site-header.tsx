'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, ScanEye } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/audit', label: 'Site Audit' },
  { href: '/screenshot', label: 'Screenshot Analysis' },
]

const PAGE_TITLES: Record<string, string> = {
  '/audit': 'Site Audit',
  '/screenshot': 'Screenshot Analysis',
}

export function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const pageTitle = PAGE_TITLES[pathname]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-1">
          {!isHome && (
            <Link
              href="/"
              aria-label="Back to home"
              className="mr-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          )}
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="AUDEXIFY home">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-[0_0_16px_-2px_var(--glow)]">
              <ScanEye className="size-4" aria-hidden="true" />
            </span>
            <span className="font-serif text-sm font-bold tracking-widest">AUDEXIFY</span>
          </Link>
          {pageTitle && (
            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center sm:flex">
              <span aria-hidden="true" className="mx-2 text-muted-foreground/50">
                /
              </span>
              <span className="truncate text-sm text-muted-foreground">{pageTitle}</span>
            </nav>
          )}
        </div>
        <nav aria-label="Main navigation">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-primary/15 font-medium text-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
