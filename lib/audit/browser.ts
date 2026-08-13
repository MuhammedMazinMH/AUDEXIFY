import 'server-only'
import { existsSync } from 'node:fs'
import type { Browser, Page } from 'puppeteer-core'

/**
 * Headless browser service.
 *
 * On Vercel (serverless) it uses @sparticuz/chromium's packaged binary.
 * Locally it falls back to a system Chrome/Chromium install or the
 * CHROME_EXECUTABLE_PATH env var.
 */

const LOCAL_CHROME_PATHS = [
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

async function resolveExecutablePath(): Promise<{ path: string; args: string[] }> {
  const chromium = (await import('@sparticuz/chromium')).default

  if (process.env.CHROME_EXECUTABLE_PATH && existsSync(process.env.CHROME_EXECUTABLE_PATH)) {
    return { path: process.env.CHROME_EXECUTABLE_PATH, args: [] }
  }

  // Serverless (Vercel/AWS): use the packaged binary
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return { path: await chromium.executablePath(), args: chromium.args }
  }

  for (const candidate of LOCAL_CHROME_PATHS) {
    if (existsSync(candidate)) return { path: candidate, args: [] }
  }

  // Last resort: try the packaged binary anyway
  return { path: await chromium.executablePath(), args: chromium.args }
}

export interface PageSession {
  browser: Browser
  page: Page
  close: () => Promise<void>
}

const HARDENING_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-background-networking',
  '--disable-default-apps',
  '--disable-sync',
  '--no-first-run',
  '--mute-audio',
]

export async function openPage(url: string, timeoutMs = 30_000): Promise<PageSession> {
  const puppeteer = (await import('puppeteer-core')).default
  const { path: executablePath, args } = await resolveExecutablePath()

  const browser = await puppeteer.launch({
    executablePath,
    args: [...new Set([...args, ...HARDENING_ARGS])],
    headless: true,
    defaultViewport: { width: 1366, height: 900 },
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36 AudexifyAudit/1.0',
    )
    // Block navigation-time resource types that slow audits without
    // affecting DOM structure relevant to accessibility checks.
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      if (req.resourceType() === 'media' || req.resourceType() === 'font') {
        req.abort().catch(() => {})
      } else {
        req.continue().catch(() => {})
      }
    })

    await page.goto(url, { waitUntil: 'networkidle2', timeout: timeoutMs })
    // Give client-rendered apps a moment to settle
    await new Promise((r) => setTimeout(r, 1_000))

    return {
      browser,
      page,
      close: async () => {
        await browser.close().catch(() => {})
      },
    }
  } catch (error) {
    await browser.close().catch(() => {})
    throw error
  }
}
