/**
 * LLM verification script — run with:
 *   node --env-file=.env.development.local scripts/verify-llm.mjs
 *
 * Tests, in order:
 *  1. Real structured output via Vercel AI Gateway (primary openai/gpt-oss-120b,
 *     fallback openai/gpt-oss-20b, pinned to Groq)
 *  2. Grounding test with the actual html-has-lang finding — verifies all
 *     required fields, that severity/priority is unchanged, and that WCAG
 *     references are not invented
 *  3. Fallback behavior — a deliberately bogus primary model must fall back
 */
import { generateObject } from 'ai'
import { z } from 'zod'

const PRIMARY = 'openai/gpt-oss-120b'
const FALLBACK = 'openai/gpt-oss-20b'
const GATEWAY = { gateway: { only: ['groq'] } }

const explanationSchema = z.object({
  title: z.string(),
  summary: z.string(),
  whyItMatters: z.string(),
  affectedUsers: z.string(),
  recommendedFix: z.string(),
  codeExample: z.string(),
  priority: z.enum(['critical', 'serious', 'moderate', 'minor']),
  wcagReferences: z.array(z.string()),
})

async function withFallback(schema, prompt, primary = PRIMARY, fallback = FALLBACK) {
  const run = async (model) => {
    const { object, providerMetadata } = await generateObject({
      model,
      system:
        'You are the explanation layer of AUDEXIFY. Explain only the findings provided. Never change severities. Never invent findings or WCAG references.',
      prompt,
      schema,
      temperature: 0.2,
      providerOptions: GATEWAY,
      maxRetries: 1,
    })
    return { object, provider: providerMetadata?.gateway?.routing?.finalProvider ?? 'unknown' }
  }
  try {
    return { ...(await run(primary)), model: primary, usedFallback: false }
  } catch (e) {
    console.log(`  primary (${primary}) failed: ${String(e.message).slice(0, 160)}`)
    return { ...(await run(fallback)), model: fallback, usedFallback: true }
  }
}

// ---- Test 1: basic structured output ----
console.log('TEST 1: structured output via gateway (Groq-pinned)')
try {
  const r = await withFallback(
    z.object({ sentiment: z.enum(['positive', 'negative', 'neutral']), confidence: z.number() }),
    'Classify the sentiment of: "This audit tool is excellent."',
  )
  console.log(`  PASS — model=${r.model} usedFallback=${r.usedFallback} provider=${r.provider}`)
  console.log(`  object=${JSON.stringify(r.object)}`)
} catch (e) {
  console.log(`  FAIL — ${String(e.message).slice(0, 300)}`)
}

// ---- Test 2: grounding test with html-has-lang ----
console.log('\nTEST 2: grounded explanation for html-has-lang')
const finding = {
  ruleId: 'html-has-lang',
  description: 'The HTML document does not have a valid language attribute.',
  severity: 'serious',
  wcag: [{ criterion: '3.1.1', name: 'Language of Page', level: 'A' }],
}
try {
  const r = await withFallback(
    explanationSchema,
    `Explain this accessibility finding.

Finding (deterministic - do not alter):
- Rule ID: ${finding.ruleId}
- Severity: ${finding.severity} (your "priority" field MUST equal exactly this value)
- Description: ${finding.description}
- WCAG criteria (the ONLY references you may cite): 3.1.1 Language of Page (Level A)
- Example element HTML: <html><head>...</head>...</html>

Produce the structured explanation.`,
  )
  const o = r.object
  const required = ['title', 'summary', 'whyItMatters', 'affectedUsers', 'recommendedFix', 'codeExample', 'priority', 'wcagReferences']
  const missing = required.filter((k) => o[k] === undefined || o[k] === '')
  const severityUnchanged = o.priority === finding.severity
  const noInventedRefs = o.wcagReferences.every((ref) => ref.includes('3.1.1'))
  console.log(`  model=${r.model} usedFallback=${r.usedFallback} provider=${r.provider}`)
  console.log(`  fields present: ${missing.length === 0 ? 'ALL PASS' : `MISSING ${missing.join(',')}`}`)
  console.log(`  severity unchanged (priority === "serious"): ${severityUnchanged ? 'PASS' : `FAIL (got ${o.priority})`}`)
  console.log(`  wcagReferences not invented (${JSON.stringify(o.wcagReferences)}): ${noInventedRefs ? 'PASS' : 'FAIL'}`)
  console.log(`  object=${JSON.stringify(o, null, 2).slice(0, 1200)}`)
} catch (e) {
  console.log(`  FAIL — ${String(e.message).slice(0, 300)}`)
}

// ---- Test 3: fallback behavior with a bogus primary ----
console.log('\nTEST 3: fallback when primary fails (bogus primary model)')
try {
  const r = await withFallback(
    z.object({ ok: z.boolean() }),
    'Return { "ok": true }.',
    'openai/nonexistent-model-xyz',
    FALLBACK,
  )
  console.log(
    `  ${r.usedFallback ? 'PASS — fell back to' : 'UNEXPECTED — primary succeeded on'} ${r.model}; object=${JSON.stringify(r.object)}`,
  )
} catch (e) {
  console.log(`  BOTH FAILED — audit would still succeed without AI. Error: ${String(e.message).slice(0, 200)}`)
}
