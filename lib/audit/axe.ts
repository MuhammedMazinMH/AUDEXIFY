import 'server-only'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import type { Page } from 'puppeteer-core'

/**
 * Injects axe-core into an already-loaded page and runs the full audit.
 * The axe source is read from node_modules and evaluated in the page
 * context, so no CDN or network access is needed at audit time.
 */

export interface RawAxeNode {
  target: string[]
  html: string
  failureSummary?: string
}

export interface RawAxeViolation {
  id: string
  impact: 'critical' | 'serious' | 'moderate' | 'minor' | null
  description: string
  help: string
  helpUrl: string
  tags: string[]
  nodes: RawAxeNode[]
}

export interface AxeRunOutput {
  violations: RawAxeViolation[]
  passes: { id: string }[]
  incomplete: RawAxeViolation[]
  testEngine: { version: string }
}

let axeSource: string | null = null

/**
 * Locates axe.min.js across every runtime layout:
 * 1. Node module resolution from the project root (dev, npm/yarn layouts)
 * 2. The plain node_modules path (hoisted installs)
 * 3. The real pnpm store path (Vercel functions: file tracing ships the
 *    .pnpm directory without recreating the node_modules symlink)
 */
function resolveAxePath(): string {
  try {
    const requireFromRoot = createRequire(path.join(process.cwd(), 'package.json'))
    return requireFromRoot.resolve('axe-core/axe.min.js')
  } catch {
    // fall through to filesystem candidates
  }

  const direct = path.join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js')
  if (existsSync(direct)) return direct

  const pnpmStore = path.join(process.cwd(), 'node_modules', '.pnpm')
  if (existsSync(pnpmStore)) {
    const entry = readdirSync(pnpmStore).find((name) => name.startsWith('axe-core@'))
    if (entry) {
      const candidate = path.join(pnpmStore, entry, 'node_modules', 'axe-core', 'axe.min.js')
      if (existsSync(candidate)) return candidate
    }
  }

  throw new Error(
    'axe-core/axe.min.js could not be located in the deployed bundle. ' +
      'Check outputFileTracingIncludes in next.config.mjs.',
  )
}

function getAxeSource(): string {
  if (!axeSource) {
    axeSource = readFileSync(resolveAxePath(), 'utf8')
  }
  return axeSource
}

export async function runAxe(page: Page): Promise<AxeRunOutput> {
  await page.evaluate(getAxeSource())

  const results = await page.evaluate(async () => {
    // @ts-expect-error axe is injected into the page context above
    const axe = window.axe
    const run = await axe.run(document, {
      resultTypes: ['violations', 'passes', 'incomplete'],
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      },
    })
    // Serialize only what we need to keep the payload small
    const slim = (v: any) => ({
      id: v.id,
      impact: v.impact ?? null,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.slice(0, 10).map((n: any) => ({
        target: n.target.map(String),
        html: String(n.html).slice(0, 400),
        failureSummary: n.failureSummary,
      })),
    })
    return {
      violations: run.violations.map(slim),
      passes: run.passes.map((p: any) => ({ id: p.id })),
      incomplete: run.incomplete.map(slim),
      testEngine: { version: run.testEngine.version },
    }
  })

  return results as AxeRunOutput
}
