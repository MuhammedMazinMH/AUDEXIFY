# AUDEXIFY

**AI-powered web accessibility intelligence.**

AUDEXIFY audits any public web page for accessibility barriers using three
independent, clearly-labeled engines — deterministic WCAG detection, a trained
machine-learning severity model, and grounded LLM explanations — so every claim
in a report carries its own provenance.

> The core design principle is **transparency over guesswork**: a finding is
> only reported as ML- or AI-derived when the real model actually ran. If a
> model artifact is missing, AUDEXIFY says so explicitly and never substitutes
> a heuristic guess.

---

## Table of contents

- [Features](#features)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Machine-learning models](#machine-learning-models)
- [API reference](#api-reference)
- [Security](#security)
- [Deployment](#deployment)

---

## Features

- **Full-page WCAG audit** — loads any public URL in a real headless Chromium
  and runs the complete [axe-core](https://github.com/dequelabs/axe-core) rule
  set for deterministic, standards-based detection.
- **Trained ML severity model** — a DistilBERT classifier (INT8-quantized ONNX)
  independently assesses the severity of each detected finding.
- **Screenshot analysis** — an EfficientNet-B0 vision model classifies uploaded
  UI screenshots into `dense_layout`, `low_contrast`, `normal`, and `small_text`
  regions for manual-review guidance.
- **Grounded AI explanations** — an LLM (via the Vercel AI Gateway, pinned to
  Groq) turns each finding into plain-language guidance with a concrete fix and
  code example. Output is schema-validated and re-grounded server-side so the
  model can never change the detected severity or invent WCAG references.
- **Provenance labels everywhere** — every result is tagged **Deterministic**,
  **Custom ML**, or **AI-generated** in the UI.
- **Honest degradation** — if a model artifact or the LLM is unavailable, the
  report says so; it never fabricates a result.
- **Responsive, accessible UI** — dark-mode-first, mobile-optimized, and
  `prefers-reduced-motion` aware — because an accessibility tool should be
  accessible itself.

---

## How it works

```
                         ┌─────────────────────────────┐
   URL ──────────────►   │  Headless Chromium + axe-core│  ── deterministic findings
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │  DistilBERT severity model    │  ── ML severity (per finding)
                         │  (ONNX, server-only)          │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │  LLM explanation (AI Gateway) │  ── grounded plain-language fix
                         │  schema-validated + re-grounded│
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                              Scored, labeled report
```

The **score** is computed deterministically from the count and severity of
axe-core violations (see [`lib/audit/score.ts`](lib/audit/score.ts)). The LLM
never influences the score.

---

## Tech stack

| Layer            | Technology                                                        |
| ---------------- | ----------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org) (App Router) · React 19          |
| Language         | TypeScript                                                        |
| Styling          | Tailwind CSS v4 · [shadcn/ui](https://ui.shadcn.com) primitives   |
| Headless browser | `puppeteer-core` + `@sparticuz/chromium`                          |
| Accessibility    | `axe-core`                                                        |
| ML runtime       | `onnxruntime-node` · `sharp` (image preprocessing)                |
| LLM              | Vercel AI SDK (`ai`) via the AI Gateway, pinned to Groq           |
| Validation       | `zod`                                                             |

---

## Project structure

```
app/
  api/
    audit/route.ts        # POST — full-page WCAG audit
    screenshot/route.ts   # POST — screenshot region analysis
    health/route.ts       # GET  — model + engine availability
  audit/page.tsx          # Site-audit UI
  screenshot/page.tsx     # Screenshot-analysis UI
  page.tsx                # Landing page
lib/
  audit/                  # browser, axe runner, normalization, scoring, orchestration
  ml/                     # ONNX NLP + vision inference, tokenizer, typed errors
  ai/                     # LLM model config, zod schemas, grounded explanations
  security/               # SSRF-safe URL guard
data/
  accessibility-rules.json # WCAG knowledge base used to ground explanations
models/
  nlp/                    # DistilBERT severity model (ONNX) + tokenizer
  vision/                 # EfficientNet-B0 region model (ONNX)
```

---

## Getting started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io) (recommended)

### Install & run

```bash
pnpm install
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
pnpm build
pnpm start
```

---

## Environment variables

All variables are optional for local development. See [`.env.example`](.env.example).

| Variable                       | Purpose                                                             |
| ------------------------------ | ------------------------------------------------------------------- |
| `AI_GATEWAY_API_KEY`           | AI Gateway key for local dev. On Vercel, OIDC is used automatically. |
| `AUDEXIFY_LLM_MODEL`           | Primary LLM (default `openai/gpt-oss-120b`).                        |
| `AUDEXIFY_LLM_FALLBACK_MODEL`  | Fallback LLM (default `openai/gpt-oss-20b`).                        |
| `CHROMIUM_EXECUTABLE_PATH`     | Override the Chromium binary path if auto-resolution fails.         |

> **Note on the AI Gateway free tier:** the LLM explanation step is rate-limited
> on the free tier and may intermittently fall back to a classification-only
> summary. Add AI Gateway credits or an `AI_GATEWAY_API_KEY` tied to a paid
> account to remove the limit.

---

## Machine-learning models

The trained ONNX models live under `models/` and are loaded **server-side only**:

| Model      | Path                            | Purpose                              |
| ---------- | ------------------------------- | ------------------------------------ |
| NLP        | `models/nlp/model_int8.onnx`    | DistilBERT finding-severity classifier |
| Tokenizer  | `models/nlp/vocab.txt`          | WordPiece vocabulary                 |
| Vision     | `models/vision/model.onnx`      | EfficientNet-B0 screenshot classifier |

**Preprocessing (vision)** exactly reproduces the training pipeline —
`Resize(256)` on the shorter edge → `CenterCrop(224)` → ImageNet normalization —
validated at 100% accuracy against the reference dataset.

If a model file is missing, the corresponding endpoint returns a structured
`503` with `code: ML_MODEL_UNAVAILABLE` (screenshot) or reports
`engine.nlp.available: false` (audit). **No heuristic prediction is ever
substituted.**

---

## API reference

### `POST /api/audit`

```jsonc
// request
{ "url": "https://example.com" }
```

Returns a scored report: overall score, deterministic issues (each with optional
ML severity and AI explanation), and an `engine` block reporting axe-core
version, NLP model status, and the LLM model used.

### `POST /api/screenshot`

`multipart/form-data` with an `image` field. Returns per-region vision
classifications and a grounded AI interpretation. Responds `503` if the vision
model is not deployed.

### `GET /api/health`

Returns availability of the axe engine, both ML models, and the LLM gateway.

---

## Security

- **SSRF protection** — submitted URLs are validated and DNS-resolved against a
  blocklist of private, loopback, and link-local ranges before any fetch
  ([`lib/security/url-guard.ts`](lib/security/url-guard.ts)).
- **Server-only ML** — model files are never exposed to the client or bundled as
  static assets.
- **Baseline hardening** — standard security response headers are applied via
  `next.config.mjs`.

---

## Deployment

AUDEXIFY is built to deploy on [Vercel](https://vercel.com). Because the ONNX
models are loaded via a runtime path (not a static import), `next.config.mjs`
uses `outputFileTracingIncludes` to guarantee the model binaries ship with the
`/api/audit` and `/api/screenshot` serverless functions.

On Vercel, the AI Gateway authenticates automatically via OIDC — no key
required.

---

<div align="center">
Built with deterministic detection, trained ML, and grounded AI — each clearly labeled.
</div>
