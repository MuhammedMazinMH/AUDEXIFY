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

export function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          {!isHome && (
            <Link
              href="/"
              aria-label="Back to overview"
              className="mr-1 flex size-8 items-center justify-center rounded-sm border border-border bg-surface-elevated text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </Link>
          )}
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            aria-label="AUDEXIFY Accessibility Intelligence"
          >
            <span className="flex size-7 items-center justify-center rounded-xs border border-primary/40 bg-primary/10 text-primary transition-all group-hover:border-primary group-hover:shadow-[0_0_12px_var(--glow)]">
              <ScanEye className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-sm font-bold tracking-widest text-foreground">
              AUDEXIFY
            </span>
          </Link>

          <span
            className="hidden text-xs font-mono text-muted-foreground/40 sm:inline"
            aria-hidden="true"
          >
            //
          </span>
          <span className="hidden font-mono text-[11px] uppercase tracking-wider text-muted-foreground md:inline">
            A11y Intelligence Engine
          </span>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors',
                  active
                    ? 'font-semibold text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {link.label}
                {active && (
                  <span
                    className="absolute inset-x-2 bottom-0 h-0.5 bg-primary shadow-[0_0_8px_var(--glow)]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Operational Status & Action */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-xs border border-border bg-surface-elevated px-2.5 py-1">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              ENGINE OPERATIONAL
            </span>
          </div>

          {pathname !== '/audit' && (
            <Link
              href="/audit"
              className="inline-flex h-8 items-center justify-center rounded-sm bg-primary px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-primary-foreground shadow-[0_0_16px_-4px_var(--glow)] transition-all hover:bg-primary/90"
            >
              Start Audit →
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-border bg-surface-elevated text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:hidden"
        >
          {menuOpen ? (
            <X className="size-4" aria-hidden="true" />
          ) : (
            <Menu className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile navigation drawer */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Mobile navigation"
          className="border-t border-border bg-background/95 px-4 pb-4 pt-3 sm:hidden"
        >
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between rounded-xs border px-3.5 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors',
                      active
                        ? 'border-primary/40 bg-primary/10 font-semibold text-primary'
                        : 'border-border bg-surface-elevated text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {link.label}
                    {active && <span className="text-primary">●</span>}
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
