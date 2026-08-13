import 'server-only'
import { readFileSync } from 'node:fs'
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

function getAxeSource(): string {
  if (!axeSource) {
    axeSource = readFileSync(
      path.join(process.cwd(), 'node_modules', 'axe-core', 'axe.min.js'),
      'utf8',
    )
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
