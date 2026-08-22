'use client'

import { useState } from 'react'
import { Check, Copy, Sparkles, Terminal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AuditIssue } from '@/types/audit'
import { generateCodeAgentPrompt } from '@/lib/audit/report-generator'

export function CodeAgentModal({
  issue,
  targetUrl,
  isOpen,
  onClose,
}: {
  issue: AuditIssue
  targetUrl?: string
  isOpen: boolean
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const promptText = generateCodeAgentPrompt(issue, targetUrl)

  function handleCopy() {
    navigator.clipboard.writeText(promptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-rise"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-3xl rounded-sm border border-border bg-[#0D100E] p-6 shadow-2xl flex flex-col gap-4 max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider font-bold">
            <Sparkles className="size-4" />
            <span id="modal-title">AI Code-Agent Remediation Prompt</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="size-4" />
          </button>
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          Paste this structured remediation prompt into <strong className="text-foreground">Cursor, Claude Code, Gemini, Antigravity, or Copilot</strong> for immediate surgical resolution.
        </p>

        {/* Prompt Codebox */}
        <div className="relative flex-1 overflow-y-auto rounded-xs border border-border bg-[#08090B] p-4 font-mono text-xs text-[#F1F0EA] leading-relaxed whitespace-pre-wrap select-all">
          {promptText}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            <Terminal className="size-3.5 text-primary" />
            <span>Target Rule: {issue.ruleId}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-mono"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handleCopy}
              className="gap-2 text-xs font-mono uppercase bg-primary text-primary-foreground"
            >
              {copied ? (
                <>
                  <Check className="size-3.5" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Agent Prompt</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
