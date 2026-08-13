import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { ScreenshotForm } from '@/components/screenshot-form'

export const metadata: Metadata = {
  title: 'Screenshot Analysis — AUDEXIFY',
  description:
    'Upload a UI screenshot and get a visual accessibility assessment powered by a custom vision classifier and AI interpretation.',
}

export default function ScreenshotPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 md:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-balance md:text-3xl">Screenshot analysis</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Upload a UI screenshot. A custom vision classifier categorizes the image and its
            regions, then the AI layer interprets the classification into concrete review items —
            useful for designs, mockups, and pages you cannot crawl.
          </p>
        </div>
        <ScreenshotForm />
      </main>
    </>
  )
}
