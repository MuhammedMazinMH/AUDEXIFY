'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Menu, ScanEye, X } from 'lucide-react'
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
  const [menuOpen, setMenuOpen] = useState(false)

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

        {/* Desktop navigation */}
        <nav aria-label="Main navigation" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
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

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:hidden"
        >
          {menuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile navigation panel */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-border bg-background/95 px-4 pb-3 pt-2 sm:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-md px-3 py-2.5 text-sm transition-colors',
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
      )}
    </header>
  )
}
