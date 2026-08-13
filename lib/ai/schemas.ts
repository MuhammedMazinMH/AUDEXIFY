import { z } from 'zod'

/** Structured output schema for a single issue explanation */
export const explanationSchema = z.object({
  title: z.string().describe('Short, plain-language title for the finding'),
  summary: z
    .string()
    .describe('A 2-3 sentence plain-language explanation of the issue for a non-technical stakeholder'),
  whyItMatters: z
    .string()
    .describe('1-2 sentences on the real-world impact of this barrier'),
  affectedUsers: z
    .string()
    .describe('One sentence describing which users are affected and how'),
  recommendedFix: z
    .string()
    .describe('Concrete, step-by-step remediation guidance for a developer, 2-4 sentences'),
  codeExample: z
    .string()
    .describe('A short before/after code snippet demonstrating the fix, using the actual HTML from the page when possible'),
  priority: z
    .enum(['critical', 'serious', 'moderate', 'minor'])
    .describe('MUST exactly equal the severity provided in the finding — never change it'),
  wcagReferences: z
    .array(z.string())
    .describe('WCAG criteria copied verbatim from the finding (e.g. "3.1.1"). Never invent references.'),
})

/** Structured output schema for the executive audit summary */
export const summarySchema = z.object({
  headline: z
    .string()
    .describe('A single sentence stating the overall accessibility posture of the page'),
  overview: z
    .string()
    .describe('A 3-4 sentence overview of the audit results in plain language'),
  topPriorities: z
    .array(z.string())
    .min(1)
    .max(4)
    .describe('The 1-4 most impactful things to fix first, each as one actionable sentence'),
})

/** Structured output schema for screenshot analysis findings */
export const screenshotAnalysisSchema = z.object({
  overallAssessment: z
    .string()
    .describe('A 2-3 sentence overall visual-accessibility assessment of the screenshot'),
  findings: z
    .array(
      z.object({
        title: z.string().describe('Short title of the potential issue'),
        severity: z.enum(['critical', 'serious', 'moderate', 'minor']),
        region: z.string().describe('Which part of the screenshot the finding concerns'),
        observation: z.string().describe('What was observed, 1-2 sentences'),
        recommendation: z.string().describe('How to address it, 1-2 sentences'),
      }),
    )
    .max(6)
    .describe('Potential visual accessibility issues worth manual review'),
})
